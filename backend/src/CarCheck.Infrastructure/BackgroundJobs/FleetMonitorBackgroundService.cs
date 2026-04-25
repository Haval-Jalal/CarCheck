using CarCheck.Application.Interfaces;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CarCheck.Infrastructure.BackgroundJobs;

/// <summary>
/// Runs once every 24 hours. For each fleet vehicle across all companies,
/// checks the latest analysis score. Sends an alert email to company admins
/// if any vehicles have critical/attention-needed scores or are unanalyzed.
/// </summary>
public class FleetMonitorBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FleetMonitorBackgroundService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    public FleetMonitorBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<FleetMonitorBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Small startup delay so the app is fully ready
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunCheckAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fleet monitor check failed");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task RunCheckAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var fleetRepo     = scope.ServiceProvider.GetRequiredService<IFleetVehicleRepository>();
        var carRepo       = scope.ServiceProvider.GetRequiredService<ICarRepository>();
        var analysisRepo  = scope.ServiceProvider.GetRequiredService<IAnalysisResultRepository>();
        var companyRepo   = scope.ServiceProvider.GetRequiredService<ICompanyRepository>();
        var memberRepo    = scope.ServiceProvider.GetRequiredService<ICompanyMemberRepository>();
        var userRepo      = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var emailService  = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var allVehicles = await fleetRepo.GetAllAsync(ct);
        if (allVehicles.Count == 0) return;

        // Group by company
        var byCompany = allVehicles.GroupBy(v => v.CompanyId);

        foreach (var group in byCompany)
        {
            var companyId = group.Key;
            var company   = await companyRepo.GetByIdAsync(companyId, ct);
            if (company is null) continue;

            var alerts = new List<FleetAlertItem>();

            foreach (var vehicle in group)
            {
                var car = await carRepo.GetByRegistrationNumberAsync(
                    RegistrationNumber.Create(vehicle.RegistrationNumber), ct);

                if (car is null)
                {
                    alerts.Add(new FleetAlertItem(vehicle.RegistrationNumber, vehicle.Nickname, 0, "Ej analyserad"));
                    continue;
                }

                var analysis = await analysisRepo.GetLatestByCarIdAsync(car.Id, ct);
                if (analysis is null)
                {
                    alerts.Add(new FleetAlertItem(vehicle.RegistrationNumber, vehicle.Nickname, 0, "Ej analyserad"));
                    continue;
                }

                var daysSince = (DateTime.UtcNow - analysis.CreatedAt).TotalDays;
                if (daysSince > 90)
                {
                    alerts.Add(new FleetAlertItem(vehicle.RegistrationNumber, vehicle.Nickname, analysis.Score, "Inaktuell analys (>90 dagar)"));
                }
                else if (analysis.Score < 40)
                {
                    alerts.Add(new FleetAlertItem(vehicle.RegistrationNumber, vehicle.Nickname, analysis.Score, "Kritisk poäng"));
                }
                else if (analysis.Score < 60)
                {
                    alerts.Add(new FleetAlertItem(vehicle.RegistrationNumber, vehicle.Nickname, analysis.Score, "Behöver uppmärksamhet"));
                }
            }

            if (alerts.Count == 0) continue;

            // Send to all admins
            var members = await memberRepo.GetByCompanyIdAsync(companyId, ct);
            var adminIds = members
                .Where(m => m.Role == Domain.Enums.CompanyMemberRole.Admin)
                .Select(m => m.UserId)
                .ToList();

            foreach (var adminId in adminIds)
            {
                var user = await userRepo.GetByIdAsync(adminId, ct);
                if (user?.Email is null) continue;

                await emailService.SendFleetAlertAsync(user.Email.Value, company.Name, alerts, ct);
                _logger.LogInformation(
                    "Fleet alert sent to {Email} for company {Company}: {Count} vehicles",
                    user.Email, company.Name, alerts.Count);
            }
        }
    }
}

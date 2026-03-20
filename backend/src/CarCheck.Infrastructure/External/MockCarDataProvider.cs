using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// Mock data provider for development and testing.
/// NOTE: All DateTime.UtcNow values are evaluated per-call (not static) to prevent
/// date drift causing score degradation over uptime.
/// Replace with real API integration (e.g., Transportstyrelsen) in production.
/// </summary>
public class MockCarDataProvider : ICarDataProvider
{
    public Task<CarDataResult?> FetchByRegistrationAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        var result = registrationNumber.Trim().ToUpperInvariant() switch
        {
            "ABC123" => BuildABC123(),
            "DEF456" => BuildDEF456(),
            "GHI789" => BuildGHI789(),
            "JKL012" => BuildJKL012(),
            "MNO345" => BuildMNO345(),
            "PQR678" => BuildPQR678(),
            _ => null,
        };
        return Task.FromResult(result);
    }

    // ── ABC123 — Volvo XC60 2021 — Utmärkt (score ~94) ──────────────────────
    private static CarDataResult BuildABC123() => new(
        "ABC123", "Volvo", "XC60", 2021, 35000,
        "Diesel", 235, "Svart",
        InsuranceIncidents: 0, ManufacturerRecalls: 0,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-3), InspectionPassed: true,
        MarketValueSek: 385000m)
    {
        NumberOfOwners = 1, IsCompanyOwned = false,
        FirstRegistrationDate = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 0m, TaxDebtSek = 0m, HasPurchaseBlock = false,
        EuroClass = "Euro 6d", Co2EmissionsGPerKm = 99, AnnualTaxSek = 460m, BonusMalusApplies = true,
        AverageMarketPriceSek = 395000m, DepreciationRatePercent = 7m,
        ServiceCount = 5, AuthorizedServiceUsed = true,
        LastServiceDate = DateTime.UtcNow.AddMonths(-4), CompleteServiceHistory = true,
        TheftRiskCategory = "Low", EuroNcapRating = 5, HasAlarmSystem = true,
        ReliabilityRating = 92m, CommonIssuesCount = 0, AverageRepairCostSek = 2800m,
        Inspections = [
            new(new DateTime(2022, 3, 10, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2023, 3, 22, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2024, 3, 5, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(DateTime.UtcNow.AddMonths(-3), true, null),
        ],
        ServiceRecords = [
            new(new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Liten service", 8700),
            new(new DateTime(2022, 3, 8, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Stor service", 17500),
            new(new DateTime(2023, 3, 20, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Liten service", 26200),
            new(new DateTime(2024, 4, 2, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Stor service", 30500),
            new(DateTime.UtcNow.AddMonths(-4), "Volvo Servicecenter Stockholm", "Liten service", 35000),
        ],
        OwnerRecords = [
            new(new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
        ],
        InsuranceIncidentRecords = [],
        RecallRecords = [],
        DebtRecords = [],
        MileageReadings = [
            new(new DateTime(2022, 3, 10, 0, 0, 0, DateTimeKind.Utc), 8750, "Besiktning"),
            new(new DateTime(2023, 3, 22, 0, 0, 0, DateTimeKind.Utc), 17500, "Besiktning"),
            new(new DateTime(2024, 4, 2, 0, 0, 0, DateTimeKind.Utc), 26250, "Service"),
            new(DateTime.UtcNow.AddMonths(-3), 35000, "Besiktning"),
        ],
        SimilarCars = [
            new("XC60", 2020, 340000m),
            new("XC60", 2021, 390000m),
            new("XC60", 2022, 445000m),
        ],
        KnownIssues = [],
        SecurityFeatures = ["Volvo On Call", "Startspärr", "Larm", "GPS-spårning"],
        IsImported = false,
        FactoryEquipment = ["Adaptiv farthållare", "Navigation", "Elstolar med minne", "Panoramaglastak", "Parkeringskamera 360°", "Keyless entry"],
        FactoryOptions = ["Dragkrok", "Vinterdäck monterade", "Luftfjädring"],
        TaxWithoutBonusMalusSek = 460m,
    };

    // ── DEF456 — BMW 320d 2018 — Godkänt (score ~65) ──────────────────────
    private static CarDataResult BuildDEF456() => new(
        "DEF456", "BMW", "320d", 2018, 87000,
        "Diesel", 190, "Vit",
        InsuranceIncidents: 1, ManufacturerRecalls: 1,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-8), InspectionPassed: true,
        MarketValueSek: 215000m)
    {
        NumberOfOwners = 2, IsCompanyOwned = false,
        FirstRegistrationDate = new DateTime(2018, 6, 1, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 45_000m, TaxDebtSek = 0m, HasPurchaseBlock = false,
        EuroClass = "Euro 6", Co2EmissionsGPerKm = 119, AnnualTaxSek = 1_360m, BonusMalusApplies = true,
        AverageMarketPriceSek = 230000m, DepreciationRatePercent = 15m,
        ServiceCount = 6, AuthorizedServiceUsed = true,
        LastServiceDate = DateTime.UtcNow.AddMonths(-6), CompleteServiceHistory = true,
        TheftRiskCategory = "Medium", EuroNcapRating = 5, HasAlarmSystem = true,
        ReliabilityRating = 72m, CommonIssuesCount = 3, AverageRepairCostSek = 8500m,
        Inspections = [
            new(new DateTime(2019, 6, 12, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2020, 6, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2021, 6, 25, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2022, 7, 3, 0, 0, 0, DateTimeKind.Utc), true, "Slitage bromsskivor fram"),
            new(DateTime.UtcNow.AddMonths(-8), true, null),
        ],
        ServiceRecords = [
            new(new DateTime(2019, 3, 5, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Liten service", 12500),
            new(new DateTime(2020, 3, 18, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Stor service", 25000),
            new(new DateTime(2021, 4, 10, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Liten service", 37500),
            new(new DateTime(2022, 5, 22, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Solna", "Stor service", 50000),
            new(new DateTime(2023, 6, 14, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Solna", "Liten service", 62500),
            new(DateTime.UtcNow.AddMonths(-6), "BMW Motorrad Stockholm", "Stor service", 87000),
        ],
        OwnerRecords = [
            new(new DateTime(2018, 6, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), false, "Göteborg"),
            new(new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
        ],
        InsuranceIncidentRecords = [
            new(new DateTime(2022, 11, 8, 0, 0, 0, DateTimeKind.Utc), "Parkeringsskada", "Mindre"),
        ],
        RecallRecords = [
            new(new DateTime(2020, 2, 14, 0, 0, 0, DateTimeKind.Utc), "Uppdatering av motorstyrningsprogramvara", true),
        ],
        DebtRecords = [
            new("Billån", 45000m, new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc)),
        ],
        MileageReadings = [
            new(new DateTime(2019, 6, 12, 0, 0, 0, DateTimeKind.Utc), 12500, "Besiktning"),
            new(new DateTime(2020, 6, 18, 0, 0, 0, DateTimeKind.Utc), 27500, "Besiktning"),
            new(new DateTime(2021, 6, 25, 0, 0, 0, DateTimeKind.Utc), 37500, "Besiktning"),
            new(new DateTime(2022, 7, 3, 0, 0, 0, DateTimeKind.Utc), 50000, "Besiktning"),
            new(new DateTime(2023, 6, 14, 0, 0, 0, DateTimeKind.Utc), 62500, "Service"),
            new(DateTime.UtcNow.AddMonths(-8), 87000, "Besiktning"),
        ],
        SimilarCars = [
            new("320d", 2017, 175000m),
            new("320d", 2018, 220000m),
            new("320d", 2019, 265000m),
        ],
        KnownIssues = ["EGR-ventil kan behöva bytas vid 120 000 km", "Kedjesträckare kontrolleras vid 100 000 km", "Oljeläckage vid oljefilterhus"],
        SecurityFeatures = ["BMW Connected Drive", "Startspärr", "Larm"],
        IsImported = false,
        FactoryEquipment = ["Sportläderstolar", "Navigation Professional", "LED-strålkastare", "Backkamera", "Parkeringssensorer fram och bak"],
        FactoryOptions = ["M Sport-paket", "Harman Kardon-ljud"],
        TaxWithoutBonusMalusSek = 952m,
    };

    // ── GHI789 — Toyota Corolla 2015 — Under genomsnittet (score ~55) ──────
    private static CarDataResult BuildGHI789() => new(
        "GHI789", "Toyota", "Corolla", 2015, 142000,
        "Bensin", 132, "Silver",
        InsuranceIncidents: 2, ManufacturerRecalls: 0,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-14), InspectionPassed: false,
        MarketValueSek: 95000m)
    {
        NumberOfOwners = 3, IsCompanyOwned = false,
        FirstRegistrationDate = new DateTime(2015, 1, 20, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 0m, TaxDebtSek = 0m, HasPurchaseBlock = false,
        EuroClass = "Euro 5", Co2EmissionsGPerKm = 135, AnnualTaxSek = 1_006m, BonusMalusApplies = false,
        AverageMarketPriceSek = 105000m, DepreciationRatePercent = 10m,
        ServiceCount = 7, AuthorizedServiceUsed = false,
        LastServiceDate = DateTime.UtcNow.AddMonths(-18), CompleteServiceHistory = false,
        TheftRiskCategory = "Low", EuroNcapRating = 4, HasAlarmSystem = false,
        ReliabilityRating = 90m, CommonIssuesCount = 1, AverageRepairCostSek = 2500m,
        Inspections = [
            new(new DateTime(2016, 1, 25, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2017, 2, 8, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2018, 1, 30, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2019, 2, 14, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2021, 3, 3, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2023, 2, 20, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(DateTime.UtcNow.AddMonths(-14), false, "Bromsskivor under gräns, handbromsen ur funktion"),
        ],
        ServiceRecords = [
            new(new DateTime(2016, 1, 20, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 13000),
            new(new DateTime(2017, 3, 10, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 26000),
            new(new DateTime(2018, 4, 5, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Stor service", 39000),
            new(new DateTime(2019, 5, 15, 0, 0, 0, DateTimeKind.Utc), "OK Q8 Bilverkstad", "Liten service", 52000),
            new(new DateTime(2020, 6, 22, 0, 0, 0, DateTimeKind.Utc), "OK Q8 Bilverkstad", "Liten service", 65000),
            new(new DateTime(2021, 8, 10, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 78000),
            new(DateTime.UtcNow.AddMonths(-18), "OK Q8 Bilverkstad", "Liten service", 117000),
        ],
        OwnerRecords = [
            new(new DateTime(2015, 1, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2018, 5, 10, 0, 0, 0, DateTimeKind.Utc), false, "Uppsala"),
            new(new DateTime(2018, 5, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), false, "Västerås"),
            new(new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
        ],
        InsuranceIncidentRecords = [
            new(new DateTime(2019, 8, 22, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Mindre"),
            new(new DateTime(2021, 4, 3, 0, 0, 0, DateTimeKind.Utc), "Stenskott vindruta", "Mindre"),
        ],
        RecallRecords = [],
        DebtRecords = [],
        MileageReadings = [
            new(new DateTime(2016, 1, 25, 0, 0, 0, DateTimeKind.Utc), 13000, "Besiktning"),
            new(new DateTime(2017, 2, 8, 0, 0, 0, DateTimeKind.Utc), 26000, "Besiktning"),
            new(new DateTime(2018, 1, 30, 0, 0, 0, DateTimeKind.Utc), 39000, "Besiktning"),
            new(new DateTime(2019, 2, 14, 0, 0, 0, DateTimeKind.Utc), 52000, "Besiktning"),
            new(new DateTime(2021, 3, 3, 0, 0, 0, DateTimeKind.Utc), 78000, "Besiktning"),
            new(new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), 91000, "Ägarebyte"),
            new(new DateTime(2023, 2, 20, 0, 0, 0, DateTimeKind.Utc), 117000, "Besiktning"),
            new(DateTime.UtcNow.AddMonths(-14), 142000, "Besiktning"),
        ],
        SimilarCars = [
            new("Corolla", 2014, 75000m),
            new("Corolla", 2015, 98000m),
            new("Corolla", 2016, 120000m),
        ],
        KnownIssues = ["Vattenpump kan börja läcka vid 150 000 km"],
        SecurityFeatures = ["Startspärr"],
        IsImported = false,
        FactoryEquipment = ["Klimatanläggning", "Bluetooth", "Farthållare", "Backkamera"],
        FactoryOptions = [],
        TaxWithoutBonusMalusSek = 1_006m,
    };

    // ── JKL012 — Tesla Model 3 2023 — Bra (score ~78) ───────────────────────
    private static CarDataResult BuildJKL012() => new(
        "JKL012", "Tesla", "Model 3", 2023, 12000,
        "El", 283, "Röd",
        InsuranceIncidents: 0, ManufacturerRecalls: 2,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-1), InspectionPassed: true,
        MarketValueSek: 420000m)
    {
        NumberOfOwners = 1, IsCompanyOwned = true,
        FirstRegistrationDate = new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 120_000m, TaxDebtSek = 0m, HasPurchaseBlock = false,
        EuroClass = "Euro 6d", Co2EmissionsGPerKm = 0, AnnualTaxSek = 360m, BonusMalusApplies = true,
        AverageMarketPriceSek = 450000m, DepreciationRatePercent = 20m,
        ServiceCount = 3, AuthorizedServiceUsed = true,
        LastServiceDate = DateTime.UtcNow.AddMonths(-2), CompleteServiceHistory = true,
        TheftRiskCategory = "Medium", EuroNcapRating = 5, HasAlarmSystem = true,
        ReliabilityRating = 75m, CommonIssuesCount = 2, AverageRepairCostSek = 12000m,
        Inspections = [
            new(new DateTime(2024, 9, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(DateTime.UtcNow.AddMonths(-1), true, null),
        ],
        ServiceRecords = [
            new(new DateTime(2024, 3, 12, 0, 0, 0, DateTimeKind.Utc), "Tesla Service Center Kungens Kurva", "Underhållsservice", 4000),
            new(new DateTime(2024, 9, 15, 0, 0, 0, DateTimeKind.Utc), "Tesla Service Center Kungens Kurva", "Underhållsservice", 8000),
            new(DateTime.UtcNow.AddMonths(-2), "Tesla Service Center Kungens Kurva", "Underhållsservice", 12000),
        ],
        OwnerRecords = [
            new(new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc), null, true, "Stockholm"),
        ],
        InsuranceIncidentRecords = [],
        RecallRecords = [
            new(new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc), "Uppdatering av autopilot-programvara", true),
            new(new DateTime(2025, 6, 5, 0, 0, 0, DateTimeKind.Utc), "Kontroll av bromssystem", false),
        ],
        DebtRecords = [
            new("Leasingavtal", 120000m, new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc)),
        ],
        MileageReadings = [
            new(new DateTime(2024, 9, 18, 0, 0, 0, DateTimeKind.Utc), 6000, "Besiktning"),
            new(DateTime.UtcNow.AddMonths(-1), 12000, "Besiktning"),
        ],
        SimilarCars = [
            new("Model 3", 2022, 370000m),
            new("Model 3", 2023, 425000m),
            new("Model Y", 2023, 460000m),
        ],
        KnownIssues = ["Sprickor i plastpaneler vid låga temperaturer", "Fantombromsning vid adaptiv farthållare"],
        SecurityFeatures = ["Tesla Sentry Mode", "GPS-spårning", "Startspärr", "Mobilapp-lås"],
        IsImported = true,
        FactoryEquipment = ["Autopilot", "15\" pekskärm", "Värmepump", "Glastak", "LED-strålkastare", "Trådlös mobilladdning"],
        FactoryOptions = ["Enhanced Autopilot", "Vit inredning"],
        TaxWithoutBonusMalusSek = 360m,
    };

    // ── MNO345 — VW Golf 2010 — Dåligt (score ~35) ──────────────────────────
    private static CarDataResult BuildMNO345() => new(
        "MNO345", "Volkswagen", "Golf", 2010, 245000,
        "Bensin", 105, "Blå",
        InsuranceIncidents: 3, ManufacturerRecalls: 1,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-26), InspectionPassed: false,
        MarketValueSek: 42000m)
    {
        NumberOfOwners = 5, IsCompanyOwned = false,
        FirstRegistrationDate = new DateTime(2010, 4, 5, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 0m, TaxDebtSek = 3500m, HasPurchaseBlock = false,
        EuroClass = "Euro 4", Co2EmissionsGPerKm = 169, AnnualTaxSek = 1_478m, BonusMalusApplies = false,
        AverageMarketPriceSek = 38000m, DepreciationRatePercent = 8m,
        ServiceCount = 4, AuthorizedServiceUsed = false,
        LastServiceDate = DateTime.UtcNow.AddMonths(-30), CompleteServiceHistory = false,
        TheftRiskCategory = "High", EuroNcapRating = 3, HasAlarmSystem = false,
        ReliabilityRating = 55m, CommonIssuesCount = 6, AverageRepairCostSek = 9000m,
        Inspections = [
            new(new DateTime(2011, 4, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2013, 5, 6, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2015, 5, 20, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2017, 6, 1, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2019, 6, 15, 0, 0, 0, DateTimeKind.Utc), false, "Rostskador på bärande balkar"),
            new(new DateTime(2021, 7, 2, 0, 0, 0, DateTimeKind.Utc), true, null),
            new(new DateTime(2023, 7, 18, 0, 0, 0, DateTimeKind.Utc), false, "Avgassystem läcker, stötdämpare slitna"),
            new(DateTime.UtcNow.AddMonths(-26), false, "Bromsskivor under gräns, oljeläckage"),
        ],
        ServiceRecords = [
            new(new DateTime(2012, 5, 10, 0, 0, 0, DateTimeKind.Utc), "Bilverkstan Huddinge", "Liten service", 30000),
            new(new DateTime(2014, 6, 3, 0, 0, 0, DateTimeKind.Utc), "Bilverkstan Huddinge", "Liten service", 65000),
            new(new DateTime(2018, 3, 20, 0, 0, 0, DateTimeKind.Utc), "DIY", "Oljebyte", 130000),
            new(DateTime.UtcNow.AddMonths(-30), "DIY", "Liten service", 198000),
        ],
        OwnerRecords = [
            new(new DateTime(2010, 4, 5, 0, 0, 0, DateTimeKind.Utc), new DateTime(2012, 8, 15, 0, 0, 0, DateTimeKind.Utc), false, "Malmö"),
            new(new DateTime(2012, 8, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2015, 3, 1, 0, 0, 0, DateTimeKind.Utc), true, "Göteborg"),
            new(new DateTime(2015, 3, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2018, 11, 20, 0, 0, 0, DateTimeKind.Utc), false, "Linköping"),
            new(new DateTime(2018, 11, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), false, "Uppsala"),
            new(new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), null, false, "Huddinge"),
        ],
        InsuranceIncidentRecords = [
            new(new DateTime(2014, 12, 3, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Allvarlig"),
            new(new DateTime(2017, 7, 19, 0, 0, 0, DateTimeKind.Utc), "Parkeringsskada", "Mindre"),
            new(new DateTime(2022, 10, 28, 0, 0, 0, DateTimeKind.Utc), "Stöld av katalysator", "Medel"),
        ],
        RecallRecords = [
            new(new DateTime(2016, 5, 10, 0, 0, 0, DateTimeKind.Utc), "Kontroll av krockkudde (Takata)", false),
        ],
        DebtRecords = [
            new("Skatteskuld", 3500m, new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc)),
        ],
        MileageReadings = [
            new(new DateTime(2011, 4, 18, 0, 0, 0, DateTimeKind.Utc), 15000, "Besiktning"),
            new(new DateTime(2013, 5, 6, 0, 0, 0, DateTimeKind.Utc), 48000, "Besiktning"),
            new(new DateTime(2015, 5, 20, 0, 0, 0, DateTimeKind.Utc), 82000, "Besiktning"),
            new(new DateTime(2017, 6, 1, 0, 0, 0, DateTimeKind.Utc), 115000, "Besiktning"),
            new(new DateTime(2019, 6, 15, 0, 0, 0, DateTimeKind.Utc), 150000, "Besiktning"),
            new(new DateTime(2021, 7, 2, 0, 0, 0, DateTimeKind.Utc), 198000, "Besiktning"),
            new(new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), 185000, "Ägarebyte"), // mätarmanipulation
            new(new DateTime(2023, 7, 18, 0, 0, 0, DateTimeKind.Utc), 218000, "Besiktning"),
            new(DateTime.UtcNow.AddMonths(-26), 245000, "Besiktning"),
        ],
        SimilarCars = [
            new("Golf", 2009, 28000m),
            new("Golf", 2010, 40000m),
            new("Golf", 2011, 52000m),
        ],
        KnownIssues = ["DSG-låda kräver regelbundet oljebyte", "Vattenpump/termostat vanligt problem", "Mekatronik-enhet kan fallera", "Turbo kan gå sönder vid 150 000 km", "Injektorer kan börja läcka", "Oljeförbrukning ökar efter 200 000 km"],
        SecurityFeatures = [],
        IsImported = false,
        FactoryEquipment = ["Klimatanläggning", "AUX-ingång"],
        FactoryOptions = [],
        TaxWithoutBonusMalusSek = 1_478m,
    };

    // ── PQR678 — Opel Vectra 2003 — Mycket dåligt / köpstopp (score ~12) ────
    private static CarDataResult BuildPQR678() => new(
        "PQR678", "Opel", "Vectra", 2003, 312000,
        "Bensin", 90, "Grå",
        InsuranceIncidents: 4, ManufacturerRecalls: 3,
        LastInspectionDate: DateTime.UtcNow.AddMonths(-36), InspectionPassed: false,
        MarketValueSek: 12000m)
    {
        NumberOfOwners = 7, IsCompanyOwned = false,
        FirstRegistrationDate = new DateTime(2003, 2, 10, 0, 0, 0, DateTimeKind.Utc),
        OutstandingDebtSek = 85_000m, TaxDebtSek = 8_200m, HasPurchaseBlock = true,
        EuroClass = "Euro 3", Co2EmissionsGPerKm = 210, AnnualTaxSek = 3_600m, BonusMalusApplies = false,
        AverageMarketPriceSek = 15000m, DepreciationRatePercent = 5m,
        ServiceCount = 2, AuthorizedServiceUsed = false,
        LastServiceDate = DateTime.UtcNow.AddMonths(-48), CompleteServiceHistory = false,
        TheftRiskCategory = "High", EuroNcapRating = 2, HasAlarmSystem = false,
        ReliabilityRating = 20m, CommonIssuesCount = 9, AverageRepairCostSek = 18000m,
        Inspections = [
            new(new DateTime(2018, 3, 5, 0, 0, 0, DateTimeKind.Utc), false, "Rostskador, avgassystem bristfälligt"),
            new(new DateTime(2020, 4, 12, 0, 0, 0, DateTimeKind.Utc), false, "Bromsar underkända, styrleder slitna"),
            new(DateTime.UtcNow.AddMonths(-36), false, "Karossrost, avgasutsläpp för höga, bromsfel"),
        ],
        ServiceRecords = [
            new(new DateTime(2015, 6, 3, 0, 0, 0, DateTimeKind.Utc), "Bilverkstan Botkyrka", "Oljebyte", 180000),
            new(DateTime.UtcNow.AddMonths(-48), "Okänd verkstad", "Liten service", 290000),
        ],
        OwnerRecords = [
            new(new DateTime(2003, 2, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2006, 5, 1, 0, 0, 0, DateTimeKind.Utc), false, "Norrköping"),
            new(new DateTime(2006, 5, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2009, 11, 8, 0, 0, 0, DateTimeKind.Utc), true, "Stockholm"),
            new(new DateTime(2009, 11, 8, 0, 0, 0, DateTimeKind.Utc), new DateTime(2012, 3, 20, 0, 0, 0, DateTimeKind.Utc), false, "Södertälje"),
            new(new DateTime(2012, 3, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2015, 7, 15, 0, 0, 0, DateTimeKind.Utc), false, "Eskilstuna"),
            new(new DateTime(2015, 7, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2018, 12, 1, 0, 0, 0, DateTimeKind.Utc), false, "Örebro"),
            new(new DateTime(2018, 12, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2022, 4, 5, 0, 0, 0, DateTimeKind.Utc), false, "Karlstad"),
            new(new DateTime(2022, 4, 5, 0, 0, 0, DateTimeKind.Utc), null, false, "Strängnäs"),
        ],
        InsuranceIncidentRecords = [
            new(new DateTime(2010, 8, 14, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Allvarlig"),
            new(new DateTime(2014, 3, 22, 0, 0, 0, DateTimeKind.Utc), "Brand i motorrum", "Allvarlig"),
            new(new DateTime(2018, 9, 5, 0, 0, 0, DateTimeKind.Utc), "Stöld av rattlås", "Medel"),
            new(new DateTime(2021, 11, 30, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Allvarlig"),
        ],
        RecallRecords = [
            new(new DateTime(2005, 4, 10, 0, 0, 0, DateTimeKind.Utc), "Bromssystem — säkerhetsåterkallning", false),
            new(new DateTime(2008, 7, 20, 0, 0, 0, DateTimeKind.Utc), "Bränslesystem — brandrisk", false),
            new(new DateTime(2012, 2, 14, 0, 0, 0, DateTimeKind.Utc), "Krockkudde Takata", false),
        ],
        DebtRecords = [
            new("Billån", 85000m, new DateTime(2022, 4, 5, 0, 0, 0, DateTimeKind.Utc)),
            new("Skatteskuld", 8200m, new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc)),
        ],
        MileageReadings = [
            new(new DateTime(2010, 3, 5, 0, 0, 0, DateTimeKind.Utc), 70000, "Besiktning"),
            new(new DateTime(2014, 4, 12, 0, 0, 0, DateTimeKind.Utc), 150000, "Besiktning"),
            new(new DateTime(2018, 3, 5, 0, 0, 0, DateTimeKind.Utc), 220000, "Besiktning"),
            new(new DateTime(2020, 4, 12, 0, 0, 0, DateTimeKind.Utc), 260000, "Besiktning"),
            new(DateTime.UtcNow.AddMonths(-36), 312000, "Besiktning"),
        ],
        SimilarCars = [
            new("Vectra", 2002, 8000m),
            new("Vectra", 2003, 12000m),
            new("Vectra", 2004, 15000m),
        ],
        KnownIssues = ["Motorblock sprucket — vanligt fel på årsmodell 2001-2004", "Automatväxellåda defekt", "Kraftiga rostangrepp på underrede", "Kylsystem läcker", "Styrservo defekt", "Korrosion på bromsledningar", "Elfel i instrumentpanel", "Turbokompressor sliten", "Katalysator igensatt"],
        SecurityFeatures = [],
        IsImported = false,
        FactoryEquipment = ["Klimatanläggning"],
        FactoryOptions = [],
        TaxWithoutBonusMalusSek = 3_600m,
    };
}

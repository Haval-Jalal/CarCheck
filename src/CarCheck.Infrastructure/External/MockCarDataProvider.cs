using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// Mock data provider for development and testing.
/// Replace with real API integration (e.g., Transportstyrelsen, Biluppgifter) in production.
/// </summary>
public class MockCarDataProvider : ICarDataProvider
{
    private static readonly Dictionary<string, CarDataResult> MockData = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ABC123"] = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black",
            InsuranceIncidents: 0, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-3), InspectionPassed: true,
            MarketValueSek: 385000m)
        {
            NumberOfOwners = 1, IsCompanyOwned = false,
            FirstRegistrationDate = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 0m, TaxDebtSek = 0m, HasPurchaseBlock = false,
            EuroClass = "Euro 6d", Co2EmissionsGPerKm = 149, AnnualTaxSek = 1_891m, BonusMalusApplies = true,
            AverageMarketPriceSek = 395000m, DepreciationRatePercent = 12m,
            ServiceCount = 5, AuthorizedServiceUsed = true,
            LastServiceDate = DateTime.UtcNow.AddMonths(-4), CompleteServiceHistory = true,
            TheftRiskCategory = "Low", EuroNcapRating = 5, HasAlarmSystem = true,
            ReliabilityRating = 85m, CommonIssuesCount = 1, AverageRepairCostSek = 4500m,

            Inspections = new List<InspectionRecord>
            {
                new(new DateTime(2022, 3, 10, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2023, 3, 22, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc), true, null),
            },
            ServiceRecords = new List<ServiceRecord>
            {
                new(new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Liten service", 8700),
                new(new DateTime(2022, 3, 8, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Stor service", 17500),
                new(new DateTime(2023, 3, 20, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Liten service", 26200),
                new(new DateTime(2024, 4, 2, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Stor service", 30500),
                new(new DateTime(2025, 10, 14, 0, 0, 0, DateTimeKind.Utc), "Volvo Servicecenter Stockholm", "Liten service", 35000),
            },
            OwnerRecords = new List<OwnerRecord>
            {
                new(new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
            },
            InsuranceIncidentRecords = new List<InsuranceIncidentRecord>(),
            RecallRecords = new List<RecallRecord>(),
            DebtRecords = new List<DebtRecord>(),
            MileageReadings = new List<MileageReadingRecord>
            {
                new(new DateTime(2022, 3, 10, 0, 0, 0, DateTimeKind.Utc), 8750, "Besiktning"),
                new(new DateTime(2023, 3, 22, 0, 0, 0, DateTimeKind.Utc), 17500, "Besiktning"),
                new(new DateTime(2024, 4, 2, 0, 0, 0, DateTimeKind.Utc), 26250, "Service"),
                new(new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc), 35000, "Besiktning"),
            },
            SimilarCars = new List<MarketComparisonRecord>
            {
                new("XC60", 2020, 340000m),
                new("XC60", 2021, 390000m),
                new("XC60", 2022, 445000m),
            },
            KnownIssues = new List<string>
            {
                "Sporadisk varning för startmotor vid kall väderlek",
            },
            SecurityFeatures = new List<string>
            {
                "Volvo On Call", "Startspärr", "Larm", "GPS-spårning",
            },
            IsImported = false,
        },

        ["DEF456"] = new CarDataResult(
            "DEF456", "BMW", "320d", 2018, 87000,
            "Diesel", 190, "White",
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

            Inspections = new List<InspectionRecord>
            {
                new(new DateTime(2019, 6, 12, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2020, 6, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2021, 6, 25, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2022, 7, 3, 0, 0, 0, DateTimeKind.Utc), true, "Slitage bromsskivor fram"),
                new(new DateTime(2025, 6, 10, 0, 0, 0, DateTimeKind.Utc), true, null),
            },
            ServiceRecords = new List<ServiceRecord>
            {
                new(new DateTime(2019, 3, 5, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Liten service", 12500),
                new(new DateTime(2020, 3, 18, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Stor service", 25000),
                new(new DateTime(2021, 4, 10, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Liten service", 37500),
                new(new DateTime(2022, 5, 22, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Solna", "Stor service", 50000),
                new(new DateTime(2023, 6, 14, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Solna", "Liten service", 62500),
                new(new DateTime(2025, 8, 2, 0, 0, 0, DateTimeKind.Utc), "BMW Motorrad Stockholm", "Stor service", 87000),
            },
            OwnerRecords = new List<OwnerRecord>
            {
                new(new DateTime(2018, 6, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), false, "Göteborg"),
                new(new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
            },
            InsuranceIncidentRecords = new List<InsuranceIncidentRecord>
            {
                new(new DateTime(2022, 11, 8, 0, 0, 0, DateTimeKind.Utc), "Parkeringsskada", "Mindre"),
            },
            RecallRecords = new List<RecallRecord>
            {
                new(new DateTime(2020, 2, 14, 0, 0, 0, DateTimeKind.Utc), "Uppdatering av motorstyrningsprogramvara", true),
            },
            DebtRecords = new List<DebtRecord>
            {
                new("Billån", 45000m, new DateTime(2021, 9, 15, 0, 0, 0, DateTimeKind.Utc)),
            },
            MileageReadings = new List<MileageReadingRecord>
            {
                new(new DateTime(2019, 6, 12, 0, 0, 0, DateTimeKind.Utc), 12500, "Besiktning"),
                new(new DateTime(2020, 3, 18, 0, 0, 0, DateTimeKind.Utc), 25000, "Service"),
                new(new DateTime(2020, 6, 18, 0, 0, 0, DateTimeKind.Utc), 27500, "Besiktning"),
                new(new DateTime(2021, 6, 25, 0, 0, 0, DateTimeKind.Utc), 37500, "Besiktning"),
                new(new DateTime(2022, 7, 3, 0, 0, 0, DateTimeKind.Utc), 50000, "Besiktning"),
                new(new DateTime(2023, 6, 14, 0, 0, 0, DateTimeKind.Utc), 62500, "Service"),
                new(new DateTime(2025, 6, 10, 0, 0, 0, DateTimeKind.Utc), 87000, "Besiktning"),
            },
            SimilarCars = new List<MarketComparisonRecord>
            {
                new("320d", 2017, 175000m),
                new("320d", 2018, 220000m),
                new("320d", 2019, 265000m),
            },
            KnownIssues = new List<string>
            {
                "EGR-ventil kan behöva bytas vid 120 000 km",
                "Kedjesträckare kontrolleras vid 100 000 km",
                "Oljeläckage vid oljefilterhus",
            },
            SecurityFeatures = new List<string>
            {
                "BMW Connected Drive", "Startspärr", "Larm",
            },
            IsImported = false,
        },

        ["GHI789"] = new CarDataResult(
            "GHI789", "Toyota", "Corolla", 2015, 142000,
            "Petrol", 132, "Silver",
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

            Inspections = new List<InspectionRecord>
            {
                new(new DateTime(2016, 1, 25, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2017, 2, 8, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2018, 1, 30, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2019, 2, 14, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2021, 3, 3, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2023, 2, 20, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc), false, "Bromsskivor slitna, handbroms ur funktion"),
            },
            ServiceRecords = new List<ServiceRecord>
            {
                new(new DateTime(2016, 1, 20, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 13000),
                new(new DateTime(2017, 3, 10, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 26000),
                new(new DateTime(2018, 4, 5, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Stor service", 39000),
                new(new DateTime(2019, 5, 15, 0, 0, 0, DateTimeKind.Utc), "OK Q8 Bilverkstad", "Liten service", 52000),
                new(new DateTime(2020, 6, 22, 0, 0, 0, DateTimeKind.Utc), "OK Q8 Bilverkstad", "Liten service", 65000),
                new(new DateTime(2021, 8, 10, 0, 0, 0, DateTimeKind.Utc), "Mekonomen Järfälla", "Liten service", 78000),
                new(new DateTime(2023, 2, 18, 0, 0, 0, DateTimeKind.Utc), "OK Q8 Bilverkstad", "Liten service", 117000),
            },
            OwnerRecords = new List<OwnerRecord>
            {
                new(new DateTime(2015, 1, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2018, 5, 10, 0, 0, 0, DateTimeKind.Utc), false, "Uppsala"),
                new(new DateTime(2018, 5, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), false, "Västerås"),
                new(new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm"),
            },
            InsuranceIncidentRecords = new List<InsuranceIncidentRecord>
            {
                new(new DateTime(2019, 8, 22, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Mindre"),
                new(new DateTime(2021, 4, 3, 0, 0, 0, DateTimeKind.Utc), "Stenskott vindruta", "Mindre"),
            },
            RecallRecords = new List<RecallRecord>(),
            DebtRecords = new List<DebtRecord>(),
            MileageReadings = new List<MileageReadingRecord>
            {
                new(new DateTime(2016, 1, 25, 0, 0, 0, DateTimeKind.Utc), 13000, "Besiktning"),
                new(new DateTime(2017, 2, 8, 0, 0, 0, DateTimeKind.Utc), 26000, "Besiktning"),
                new(new DateTime(2018, 1, 30, 0, 0, 0, DateTimeKind.Utc), 39000, "Besiktning"),
                new(new DateTime(2019, 2, 14, 0, 0, 0, DateTimeKind.Utc), 52000, "Besiktning"),
                new(new DateTime(2020, 6, 22, 0, 0, 0, DateTimeKind.Utc), 65000, "Service"),
                new(new DateTime(2021, 3, 3, 0, 0, 0, DateTimeKind.Utc), 78000, "Besiktning"),
                new(new DateTime(2022, 8, 1, 0, 0, 0, DateTimeKind.Utc), 91000, "Ägarebyte"),
                new(new DateTime(2023, 2, 20, 0, 0, 0, DateTimeKind.Utc), 117000, "Besiktning"),
                new(new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc), 142000, "Besiktning"),
            },
            SimilarCars = new List<MarketComparisonRecord>
            {
                new("Corolla", 2014, 75000m),
                new("Corolla", 2015, 98000m),
                new("Corolla", 2016, 120000m),
            },
            KnownIssues = new List<string>
            {
                "Vattenpump kan börja läcka vid 150 000 km",
            },
            SecurityFeatures = new List<string>
            {
                "Startspärr",
            },
            IsImported = false,
        },

        ["JKL012"] = new CarDataResult(
            "JKL012", "Tesla", "Model 3", 2023, 12000,
            "Electric", 283, "Red",
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

            Inspections = new List<InspectionRecord>
            {
                new(new DateTime(2024, 9, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc), true, null),
            },
            ServiceRecords = new List<ServiceRecord>
            {
                new(new DateTime(2024, 3, 12, 0, 0, 0, DateTimeKind.Utc), "Tesla Service Center Kungens Kurva", "Underhållsservice", 4000),
                new(new DateTime(2024, 9, 15, 0, 0, 0, DateTimeKind.Utc), "Tesla Service Center Kungens Kurva", "Underhållsservice", 8000),
                new(new DateTime(2025, 12, 3, 0, 0, 0, DateTimeKind.Utc), "Tesla Service Center Kungens Kurva", "Underhållsservice", 12000),
            },
            OwnerRecords = new List<OwnerRecord>
            {
                new(new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc), null, true, "Stockholm"),
            },
            InsuranceIncidentRecords = new List<InsuranceIncidentRecord>(),
            RecallRecords = new List<RecallRecord>
            {
                new(new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc), "Uppdatering av autopilot-programvara", true),
                new(new DateTime(2025, 6, 5, 0, 0, 0, DateTimeKind.Utc), "Kontroll av bromssystem", false),
            },
            DebtRecords = new List<DebtRecord>
            {
                new("Leasingavtal", 120000m, new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc)),
            },
            MileageReadings = new List<MileageReadingRecord>
            {
                new(new DateTime(2024, 9, 18, 0, 0, 0, DateTimeKind.Utc), 6000, "Besiktning"),
                new(new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc), 12000, "Besiktning"),
            },
            SimilarCars = new List<MarketComparisonRecord>
            {
                new("Model 3", 2022, 370000m),
                new("Model 3", 2023, 425000m),
                new("Model Y", 2023, 460000m),
            },
            KnownIssues = new List<string>
            {
                "Sprickor i plastpaneler vid låga temperaturer",
                "Fantombromsning vid adaptiv farthållare",
            },
            SecurityFeatures = new List<string>
            {
                "Tesla Sentry Mode", "GPS-spårning", "Startspärr", "Mobilapp-lås",
            },
            IsImported = true,
        },

        ["MNO345"] = new CarDataResult(
            "MNO345", "Volkswagen", "Golf", 2010, 245000,
            "Petrol", 105, "Blue",
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

            Inspections = new List<InspectionRecord>
            {
                new(new DateTime(2011, 4, 18, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2012, 4, 22, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2013, 5, 6, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2014, 5, 12, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2015, 5, 20, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2017, 6, 1, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2019, 6, 15, 0, 0, 0, DateTimeKind.Utc), false, "Rostskador på bärande balkar"),
                new(new DateTime(2021, 7, 2, 0, 0, 0, DateTimeKind.Utc), true, null),
                new(new DateTime(2023, 7, 18, 0, 0, 0, DateTimeKind.Utc), false, "Avgassystem läcker, stötdämpare slitna"),
                new(new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc), false, "Bromsskivor under gräns, oljeläckage"),
            },
            ServiceRecords = new List<ServiceRecord>
            {
                new(new DateTime(2012, 5, 10, 0, 0, 0, DateTimeKind.Utc), "Bilverkstan Huddinge", "Liten service", 30000),
                new(new DateTime(2014, 6, 3, 0, 0, 0, DateTimeKind.Utc), "Bilverkstan Huddinge", "Liten service", 65000),
                new(new DateTime(2018, 3, 20, 0, 0, 0, DateTimeKind.Utc), "DIY", "Oljebyte", 130000),
                new(new DateTime(2021, 11, 5, 0, 0, 0, DateTimeKind.Utc), "DIY", "Liten service", 198000),
            },
            OwnerRecords = new List<OwnerRecord>
            {
                new(new DateTime(2010, 4, 5, 0, 0, 0, DateTimeKind.Utc), new DateTime(2012, 8, 15, 0, 0, 0, DateTimeKind.Utc), false, "Malmö"),
                new(new DateTime(2012, 8, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2015, 3, 1, 0, 0, 0, DateTimeKind.Utc), true, "Göteborg"),
                new(new DateTime(2015, 3, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2018, 11, 20, 0, 0, 0, DateTimeKind.Utc), false, "Linköping"),
                new(new DateTime(2018, 11, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), false, "Uppsala"),
                new(new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), null, false, "Huddinge"),
            },
            InsuranceIncidentRecords = new List<InsuranceIncidentRecord>
            {
                new(new DateTime(2014, 12, 3, 0, 0, 0, DateTimeKind.Utc), "Kollision", "Allvarlig"),
                new(new DateTime(2017, 7, 19, 0, 0, 0, DateTimeKind.Utc), "Parkeringsskada", "Mindre"),
                new(new DateTime(2022, 10, 28, 0, 0, 0, DateTimeKind.Utc), "Stöld av katalysator", "Medel"),
            },
            RecallRecords = new List<RecallRecord>
            {
                new(new DateTime(2016, 5, 10, 0, 0, 0, DateTimeKind.Utc), "Kontroll av krockkudde (Takata)", false),
            },
            DebtRecords = new List<DebtRecord>
            {
                new("Skatteskuld", 3500m, new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc)),
            },
            MileageReadings = new List<MileageReadingRecord>
            {
                new(new DateTime(2011, 4, 18, 0, 0, 0, DateTimeKind.Utc), 15000, "Besiktning"),
                new(new DateTime(2012, 4, 22, 0, 0, 0, DateTimeKind.Utc), 30000, "Besiktning"),
                new(new DateTime(2013, 5, 6, 0, 0, 0, DateTimeKind.Utc), 48000, "Besiktning"),
                new(new DateTime(2014, 5, 12, 0, 0, 0, DateTimeKind.Utc), 65000, "Besiktning"),
                new(new DateTime(2015, 5, 20, 0, 0, 0, DateTimeKind.Utc), 82000, "Besiktning"),
                new(new DateTime(2016, 6, 8, 0, 0, 0, DateTimeKind.Utc), 98000, "Service"),
                new(new DateTime(2017, 6, 1, 0, 0, 0, DateTimeKind.Utc), 115000, "Besiktning"),
                new(new DateTime(2018, 3, 20, 0, 0, 0, DateTimeKind.Utc), 130000, "Service"),
                new(new DateTime(2019, 6, 15, 0, 0, 0, DateTimeKind.Utc), 150000, "Besiktning"),
                new(new DateTime(2020, 8, 10, 0, 0, 0, DateTimeKind.Utc), 168000, "Service"),
                new(new DateTime(2021, 7, 2, 0, 0, 0, DateTimeKind.Utc), 198000, "Besiktning"),
                // Suspicious mileage drop — possible odometer tampering
                new(new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc), 185000, "Ägarebyte"),
                new(new DateTime(2023, 7, 18, 0, 0, 0, DateTimeKind.Utc), 218000, "Besiktning"),
                new(new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc), 245000, "Besiktning"),
            },
            SimilarCars = new List<MarketComparisonRecord>
            {
                new("Golf", 2009, 28000m),
                new("Golf", 2010, 40000m),
                new("Golf", 2011, 52000m),
            },
            KnownIssues = new List<string>
            {
                "DSG-låda kräver regelbundet oljebyte",
                "Vattenpump/termostat vanligt problem",
                "Mekatronik-enhet kan fallera",
                "Turbo kan gå sönder vid 150 000 km",
                "Injektorer kan börja läcka",
                "Oljeförbrukning ökar efter 200 000 km",
            },
            SecurityFeatures = new List<string>(),
            IsImported = false,
        }
    };

    public Task<CarDataResult?> FetchByRegistrationAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        MockData.TryGetValue(registrationNumber.Trim().ToUpperInvariant(), out var result);
        return Task.FromResult(result);
    }
}

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first (for layer caching)
COPY CarCheck.sln .
COPY src/CarCheck.Domain/CarCheck.Domain.csproj src/CarCheck.Domain/
COPY src/CarCheck.Application/CarCheck.Application.csproj src/CarCheck.Application/
COPY src/CarCheck.Infrastructure/CarCheck.Infrastructure.csproj src/CarCheck.Infrastructure/
COPY src/CarCheck.API/CarCheck.API.csproj src/CarCheck.API/
RUN dotnet restore CarCheck.sln --runtime linux-x64

# Copy everything and build
COPY . .
RUN dotnet publish src/CarCheck.API/CarCheck.API.csproj \
    --configuration Release \
    --runtime linux-x64 \
    --self-contained false \
    --output /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Security: run as non-root
RUN groupadd -r carcheck && useradd -r -g carcheck carcheck
USER carcheck

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "CarCheck.API.dll"]

# ====================================================================
# Dockerfile Multietapa para ULEAM-EVENTOS API (.NET 9 / C#)
# Optimizado para despliegue en Render, Railway o Fly.io
# ====================================================================

# 1. Etapa de Compilación
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar csproj y restaurar dependencias
COPY ["UleamEventos.Api.csproj", "./"]
RUN dotnet restore "UleamEventos.Api.csproj"

# Copiar el resto del código y compilar en Release
COPY . .
RUN dotnet publish "UleamEventos.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Etapa de Ejecución (Runtime Ligero)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Configuración del Puerto en Render (Render inyecta PORT dinámicamente)
ENV PORT=8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "UleamEventos.Api.dll"]

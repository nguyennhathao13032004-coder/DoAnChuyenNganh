# Sử dụng môi trường SDK 10.0 để build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file csproj và restore
COPY ["backend-saha.csproj", "./"]
RUN dotnet restore "./backend-saha.csproj"

# Copy toàn bộ code và build
COPY . .
RUN dotnet publish "backend-saha.csproj" -c Release -o /app/publish

# Sử dụng môi trường Runtime 10.0 để chạy
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "backend-saha.dll"]
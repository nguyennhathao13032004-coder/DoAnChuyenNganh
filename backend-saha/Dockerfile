# Sử dụng môi trường SDK để build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend-saha.csproj", "./"]
RUN dotnet restore "./backend-saha.csproj"
COPY . .
RUN dotnet publish "backend-saha.csproj" -c Release -o /app/publish

# Sử dụng môi trường siêu nhẹ để chạy web
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "backend-saha.dll"]
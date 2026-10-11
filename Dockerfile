# One image for the whole app: the API serves the built client from wwwroot, so the UI
# and API share one origin and one port (8080). Progress lives in SQLite at $DbPath,
# which should be a mounted volume.
#
#   docker build -t conperio-academy .
#   docker run -p 8080:8080 -v academy-data:/data conperio-academy

# The in-browser C# runtime (Roslyn on .NET WebAssembly) that grades C# exercises in the
# learner's browser; see wasm-csharp/README.md. It shares CodePolicy.cs with runner/.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS csharp-wasm
WORKDIR /src
COPY runner/CodePolicy.cs runner/RunnerProtocol.cs runner/
COPY wasm-csharp/CSharpWasm.csproj wasm-csharp/Program.cs wasm-csharp/build.sh wasm-csharp/
RUN mkdir -p client/public && bash wasm-csharp/build.sh

FROM node:22-alpine AS client
WORKDIR /src/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
# vite.config.ts copies it into dist/ as THIRD_PARTY_NOTICES.txt.
COPY THIRD_PARTY_NOTICES.md /src/
# Into public/ before the build, so Vite copies it into dist/ with everything else.
COPY --from=csharp-wasm /src/client/public/csharp-wasm ./public/csharp-wasm
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server
WORKDIR /src
COPY server/server.csproj server/
COPY runner/runner.csproj runner/
RUN dotnet restore server/server.csproj
COPY server/ server/
COPY runner/ runner/
RUN dotnet publish server/server.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=server /app ./
COPY --from=client /src/client/dist ./wwwroot
RUN mkdir -p /data && chown app /data
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DbPath=/data/progress.db
# The image's built-in non-root user; C# submissions run in child processes as this
# same unprivileged user (see server/Execution/CSharpExecutor.cs).
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "server.dll"]

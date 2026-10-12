using DsaAcademy.Content;

// Writes the lesson content as the JSON files the site loads (see ContentExport.cs):
//
//   dotnet run --project content -- <output dir>
//
// client/scripts/export-content.mjs runs this for `npm run dev` and `npm run build`.
if (args is not [var outputDir])
{
    Console.Error.WriteLine("Usage: dotnet run --project content -- <output dir>");
    return 1;
}

ContentExport.Write(outputDir);
return 0;

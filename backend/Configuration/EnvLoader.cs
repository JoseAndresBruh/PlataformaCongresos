using System;
using System.IO;

namespace UleamEventos.Api.Configuration
{
    public static class EnvLoader
    {
        public static void Load(string filePath = ".env")
        {
            if (!File.Exists(filePath))
            {
                // Buscar en directorio padre o ruta de ejecución
                var altPath = Path.Combine(AppContext.BaseDirectory, filePath);
                if (File.Exists(altPath))
                {
                    filePath = altPath;
                }
                else
                {
                    return;
                }
            }

            foreach (var line in File.ReadAllLines(filePath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#"))
                    continue;

                var idx = trimmed.IndexOf('=');
                if (idx > 0)
                {
                    var key = trimmed.Substring(0, idx).Trim();
                    var val = trimmed.Substring(idx + 1).Trim();
                    if (val.StartsWith("\"") && val.EndsWith("\"") && val.Length >= 2)
                    {
                        val = val.Substring(1, val.Length - 2);
                    }
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
    }
}

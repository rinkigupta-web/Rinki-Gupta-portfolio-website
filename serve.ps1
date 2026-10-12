param([int]$Port = 3000)

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Collections.Generic;

public class HighSpeedStaticServer {
    private HttpListener _listener;
    private string _root;
    private int _port;
    private bool _running;
    private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { ".html", "text/html; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".js", "application/javascript; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".svg", "image/svg+xml" },
        { ".webp", "image/webp" },
        { ".woff2", "font/woff2" },
        { ".woff", "font/woff" },
        { ".ttf", "font/ttf" },
        { ".ico", "image/x-icon" }
    };

    public HighSpeedStaticServer(string root, int port) {
        _root = root;
        _port = port;
    }

    public void Start() {
        _listener = new HttpListener();
        _listener.Prefixes.Add("http://localhost:" + _port + "/");
        _listener.Prefixes.Add("http://127.0.0.1:" + _port + "/");
        _listener.Start();
        _running = true;
        Console.WriteLine("========================================================");
        Console.WriteLine("  Jack.3D Portfolio High-Speed Server Active");
        Console.WriteLine("  URL: http://localhost:" + _port);
        Console.WriteLine("========================================================");

        ThreadPool.QueueUserWorkItem(ListenLoop);
    }

    private void ListenLoop(object state) {
        while (_running) {
            try {
                var context = _listener.GetContext();
                ThreadPool.QueueUserWorkItem(ProcessRequest, context);
            } catch {
                if (!_running) break;
            }
        }
    }

    private void ProcessRequest(object state) {
        var context = (HttpListenerContext)state;
        var request = context.Request;
        var response = context.Response;

        try {
            string rawPath = request.Url.LocalPath;
            if (string.IsNullOrEmpty(rawPath) || rawPath == "/") {
                rawPath = "/index.html";
            }

            string decodedPath = Uri.UnescapeDataString(rawPath).TrimStart('/', '\\');
            string fullPath = Path.GetFullPath(Path.Combine(_root, decodedPath));

            if (!fullPath.StartsWith(_root, StringComparison.OrdinalIgnoreCase)) {
                response.StatusCode = 403;
                byte[] forbidden = System.Text.Encoding.UTF8.GetBytes("403 Forbidden");
                response.ContentLength64 = forbidden.Length;
                response.OutputStream.Write(forbidden, 0, forbidden.Length);
                response.Close();
                return;
            }

            if (File.Exists(fullPath)) {
                string ext = Path.GetExtension(fullPath);
                string contentType;
                if (!MimeTypes.TryGetValue(ext, out contentType)) {
                    contentType = "application/octet-stream";
                }

                response.ContentType = contentType;
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Cache-Control", "public, max-age=86400");

                if (request.HttpMethod.Equals("HEAD", StringComparison.OrdinalIgnoreCase)) {
                    var fi = new FileInfo(fullPath);
                    response.ContentLength64 = fi.Length;
                    response.StatusCode = 200;
                    response.Close();
                    return;
                }

                using (var fs = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                    response.ContentLength64 = fs.Length;
                    response.StatusCode = 200;
                    byte[] buffer = new byte[64 * 1024];
                    int read;
                    while ((read = fs.Read(buffer, 0, buffer.Length)) > 0) {
                        response.OutputStream.Write(buffer, 0, read);
                    }
                }
            } else {
                response.StatusCode = 404;
                byte[] notFound = System.Text.Encoding.UTF8.GetBytes("404 Not Found: " + decodedPath);
                response.ContentLength64 = notFound.Length;
                response.OutputStream.Write(notFound, 0, notFound.Length);
            }
        } catch {
        } finally {
            try {
                response.Close();
            } catch {}
        }
    }

    public void Stop() {
        _running = false;
        if (_listener != null) {
            _listener.Stop();
            _listener.Close();
        }
    }
}
"@

$server = New-Object HighSpeedStaticServer($PSScriptRoot, $Port)
$server.Start()

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $server.Stop()
}

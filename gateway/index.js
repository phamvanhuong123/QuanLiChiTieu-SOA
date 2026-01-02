const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const app = express();

app.use(cors());

// Middleware bảo mật: Chặn API internal
app.use((req, res, next) => {
  if (req.url.includes("/internal/")) {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
});

// Routing
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);
app.use(
  "/api/core",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { "^/api/core": "" },
  })
);
app.use(
  "/api/reports",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: { "^/api/reports": "" },
  })
);

app.listen(3000, () => console.log(" Gateway running on Port 3000"));

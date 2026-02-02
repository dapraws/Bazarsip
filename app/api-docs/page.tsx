"use client";

import { useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { swaggerSpec } from "@/lib/swagger";

export default function ApiDocsPage() {
  useEffect(() => {
    // Add custom styling for better appearance
    const style = document.createElement("style");
    style.textContent = `
      .swagger-ui .topbar {
        display: none;
      }
      .swagger-ui .info {
        margin: 20px 0;
      }
      .swagger-ui .scheme-container {
        background: #fafafa;
        padding: 20px;
        margin: 20px 0;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Bazarsip API Documentation
          </h1>
          <p className="text-blue-100 text-lg">
            Complete REST API documentation with interactive testing
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="bg-blue-700 px-3 py-1 rounded-full">
              Version 1.0.0
            </div>
            <div className="bg-blue-700 px-3 py-1 rounded-full">
              OpenAPI 3.0
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Instructions */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Most endpoints require authentication. To test authenticated
                  endpoints:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    First, use the <strong>POST /api/auth/login</strong>{" "}
                    endpoint
                  </li>
                  <li>
                    Use credentials:{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      admin@bazarsip.com
                    </code>{" "}
                    /{" "}
                    <code className="bg-yellow-100 px-1 rounded">admin123</code>
                  </li>
                  <li>The JWT token will be automatically stored in cookies</li>
                  <li>
                    Subsequent requests will use the cookie for authentication
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <a
              href="#/Authentication"
              className="text-blue-700 hover:text-blue-900 text-sm hover:underline"
            >
              🔐 Authentication
            </a>
            <a
              href="#/Categories"
              className="text-blue-700 hover:text-blue-900 text-sm hover:underline"
            >
              📁 Categories
            </a>
            <a
              href="#/Products"
              className="text-blue-700 hover:text-blue-900 text-sm hover:underline"
            >
              📦 Products
            </a>
            <a
              href="#/Orders"
              className="text-blue-700 hover:text-blue-900 text-sm hover:underline"
            >
              🛒 Orders
            </a>
            <a
              href="#/Users"
              className="text-blue-700 hover:text-blue-900 text-sm hover:underline"
            >
              👥 Users
            </a>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <SwaggerUI
          spec={swaggerSpec}
          persistAuthorization={true}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          displayRequestDuration={true}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>
            Bazarsip E-commerce API © 2026 | Built with Next.js 15 & PostgreSQL
          </p>
          <p className="mt-2">
            Need help? Contact{" "}
            <a
              href="mailto:support@bazarsip.com"
              className="text-blue-600 hover:underline"
            >
              support@bazarsip.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * HomePage component allows users to input a URL and generates an HTML clone preview using a backend service.
 */
export default function HomePage() {
  // Stores the URL input by the user
  const [url, setUrl] = useState("");

  // Stores the generated HTML preview
  const [htmlPreview, setHtmlPreview] = useState("");

  // Indicates whether the app is currently fetching the preview
  const [loading, setLoading] = useState(false);

  // Displays validation or fetch error messages
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Handles form submission to validate the input and request an HTML clone from the backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and validate user input
    let formattedUrl = url.trim();
    if (!formattedUrl) {
      setErrorMessage("please enter a url");
      return;
    }

    // Ensure the URL includes a protocol
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "http://" + formattedUrl;
    }

    // Additional structural validation
    try {
      const urlObject = new URL(formattedUrl);
      const isValidProtocol = /^https?:$/.test(urlObject.protocol);
      const isValidHostname = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        urlObject.hostname
      );
      if (!isValidProtocol || !isValidHostname) {
        setErrorMessage("please enter a valid url");
        return;
      }
      setUrl(formattedUrl);
      setErrorMessage("");
    } catch {
      setErrorMessage("please enter a valid url");
      return;
    }

    // Attempt to fetch the HTML preview from the backend
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const html = await res.text();
      setHtmlPreview(html);
    } catch (err) {
      console.error("Error fetching preview:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white font-sans flex justify-center items-start px-4 py-12">
      <div className="w-full max-w-3xl flex flex-col items-center gap-10">
        <Image
          src="/orchids.png"
          alt="Orchids Logo"
          width={240}
          height={120}
          className="mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold self-start ml-6">
          clone any web page
        </h1>
        <div className="w-full relative">
          <form
            onSubmit={handleSubmit}
            className={`w-full flex items-center bg-[#1e1e1e] border border-gray-700 rounded-full overflow-hidden "border-wrapper p-[3px]" : ""`}
          >
            <div className="flex-1 rounded-l-full">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setErrorMessage("");
                  setUrl(e.target.value);
                }}
                onBlur={() => {
                  // Provide immediate feedback if the input is empty or malformed
                  const trimmed = url.trim();
                  if (!trimmed) {
                    setErrorMessage("please enter a url");
                  } else if (!/^https?:\/\/.+\..+/.test(trimmed)) {
                    setErrorMessage("please enter a valid url");
                  }
                }}
                placeholder="enter a web url"
                className={`w-full px-6 py-4 text-lg bg-[#1e1e1e] text-white focus:outline-none rounded-l-full`}
              />
            </div>
            <button
              type="submit"
              className="relative bg-white text-black text-lg px-8 py-4 font-semibold rounded-r-full transition-transform duration-300 hover:scale-105 group overflow-hidden"
            >
              <span className="absolute inset-0 group-hover:bg-gradient-to-r group-hover:from-[#FE97F9] group-hover:via-[#83C9F4] group-hover:to-[#FE97F9] bg-white bg-[length:200%_200%] bg-left group-hover:animate-button-gradient z-0 transition-all duration-300"></span>
              <span className="relative z-10 group-hover:text-white">
                clone
              </span>
            </button>
          </form>
          {errorMessage && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 text-white text-sm rounded-full shadow p-[2px] z-10">
              <div className="bg-[#1e1e1e] rounded-full px-4 py-2">
                {errorMessage}
              </div>
            </div>
          )}
        </div>
        {(loading || htmlPreview) && (
          <div className="w-full p-6 mt-6 flex flex-col gap-4 items-center">
            {loading ? (
              <div className="border-wrapper p-[2px] rounded-full">
                <div className="bg-[#000000] text-white text-lg text-center px-6 py-3 rounded-full">
                  working some magic...
                </div>
              </div>
            ) : (
              <>
                {/* Display the generated preview in an iframe */}
                <iframe
                  srcDoc={htmlPreview}
                  className="w-full h-[500px] border border-gray-600 rounded"
                />
                {/* Allow users to download the generated HTML file */}
                <button
                  onClick={() => {
                    const blob = new Blob([htmlPreview], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "generated_page.html";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-sm text-blue-400 underline text-center mt-2"
                >
                  click for html file download
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

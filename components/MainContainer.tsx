"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useState } from "react";

const MainConatiner = () => {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeyWords] = useState<string[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      //   console.log(e.target.files[0]);
      setImage(e.target.files[0]);
    }
  };

  const identifyImage = async (additionPrompts: string = "") => {
    if (!image) return;
    setLoading(true);

    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    try {
      const imageParts = await fileToGenerativePart(image);
      const result = await model.generateContent([
        `Identifying this image provides its name and important information including a brief explanation about the image. 
        ${additionPrompts}`,
        imageParts,
      ]);

      const response = await result.response;
      const text = response
        .text()
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "");
      setResult(text);
      generateKeywords(text);
      await generateRelatedQuestions(text);
    } catch (error) {
      console.log((error as Error)?.message);
    } finally {
      setLoading(false);
    }
  };

  const fileToGenerativePart = async (
    file: File
  ): Promise<{
    inlineData: {
      data: string;
      mimeType: string;
    };
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(",")[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateKeywords = (text: string) => {
    const words = text.split(/\s+/);
    const keywordsSet = new Set<string>();

    words.forEach((word) => {
      if (
        word.length > 4 &&
        !["this", "that", "with", "from", "have"].includes(word.toLowerCase())
      ) {
        keywordsSet.add(word);
      }
    });
    setKeyWords(Array.from(keywordsSet).slice(0, 5));
  };

  const regenerateContent = (keyword: string) => {
    identifyImage(`Focus on the ${keyword} in the image`);
  };

  const generateRelatedQuestions = async (text: string) => {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    try {
      const result = await model.generateContent([
        `Generate 5 related questions based on this text: ${text}
        Format the output as a simple list of questions, one per line.
        `,
      ]);
      const response = await result.response;
      const question = response.text().trim().split("\n");
      setRelatedQuestions(question);
    } catch (error) {
      console.log((error as Error)?.message);
      setRelatedQuestions([]);
    }
  };

  const askRelatedQuestions = (question: string) => {
    identifyImage(
      `Answer the following question about the image: "${question}".`
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            Analyse your Image
          </h2>
          <div className="mb-8">
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload an image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-400 hover:file:bg-orange-100 transition duration-150 ease-in-out"
            />
          </div>
          {/* display image */}
          {image && (
            <div className="mb-8 flex justify-center">
              <Image
                src={URL.createObjectURL(image)}
                alt="Uploaded Image"
                width={300}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => identifyImage()}
            disabled={loading || !image}
            className="w-full bg-orange-400 text-white py-3 px-4 rounded-lg hover:bg-orange-500 transition duration-150 ease-in-out disabled:cursor-not-allowed font-medium text-lg disabled:bg-orange-400"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
        {result && (
          <div
            className="bg-orange-50 border-t border-orange-200 p-8"
            id="result"
          >
            <h3 className="text-2xl font-bold text-gray-00 mb-4">
              Image Information
            </h3>
            <div className="max-w-none">
              {result.split("\n").map((line, index) => {
                if (
                  line.startsWith("Important Information:") ||
                  line.startsWith("Other Information:")
                ) {
                  return (
                    <h4
                      className="text-xl font-semibold mt-4 mb-2 text-orange-500"
                      key={index}
                    >
                      {line}
                    </h4>
                  );
                } else if (line.match(/^\d+\./) || line.startsWith("-")) {
                  return (
                    <li key={index} className="ml-4 mb-2 text-gray-700">
                      {line}
                    </li>
                  );
                } else if (line.trim() !== "") {
                  return (
                    <p key={index} className="mb-2 text-gray-800">
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2 text-orange-400">
                Related Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <button
                    onClick={() => regenerateContent(keyword)}
                    className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-500 transition duration-150 ease-in-out"
                    key={index}
                    type="button"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
            {relatedQuestions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2 text-orange-400">
                  Related Questions
                </h4>
                <ul className="space-y-2">
                  {relatedQuestions.map((question, index) => (
                    <li key={index}>
                      <button
                        onClick={() => askRelatedQuestions(question)}
                        type="button"
                        className="text-left bg-orange-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-400 transition duration-150 ease-in-out"
                      >
                        {question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <section id="how-it-works" className="mt-16">
        <h2 className="text-3xl font-extrabold text-gray-900 m-8 text-center">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Upload Image", "AI Analysis", "Get Results"].map((step, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 transition duration-150 ease-in-out transform hover:scale-105">
              <div className="text-3xl font-bold text-orange-400 mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {step}
              </h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your uploaded image and provides detailed information about its contents.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mt-16">
        <h2 className="text-3xl font-extrabold text-gray-900 m-8 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Accurate identification", "Detailed Information", "Fast Results", "User Friendly Interface"].map((step, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 transition duration-150 ease-in-out transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2 text-orange-400">
                {step}
              </h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your uploaded image and provides detailed information about its contents.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default MainConatiner;

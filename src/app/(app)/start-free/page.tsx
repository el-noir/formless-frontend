'use client';

import React, { useState } from 'react';
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navbar } from '@/components/Navbar';
import { Background } from '@/components/Background';
import { checkFree } from '@/lib/api/startFree';

type Choice = {
  label: string;
  value?: string;
};

type FormField = {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  choices?: Choice[];
};

type ExtractedSchema = {
  id: string;
  platform: string;
  metadata: {
    title: string;
    description?: string;
    totalFields: number;
    totalRequired: number;
  };
  fields: FormField[];
};

type CheckFreeForm = {
  url: string;
};

function StartFreePage() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<ExtractedSchema | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckFreeForm>({
    mode: "onBlur",
  });

  const onSubmit = async (data: CheckFreeForm) => {
    setError("");
    setSchema(null);
    setLoading(true);

    try {
      const response = await checkFree(data.url);

      // backend returns schema directly
      setSchema(response);

    } catch (err) {
      setError("Failed to extract data from the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative">
      <Background />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
          Start Your Free Trial
        </h1>

        <p className="text-lg text-gray-400 mb-8 text-center">
          Enter your Google Form URL to preview and convert it into a conversational experience.
        </p>

        {/* FORM INPUT */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <input
            type="text"
            placeholder="Enter Google Form URL"
            {...register("url", { required: "URL is required" })}
            className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-[#1C1C24] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#6E8BFF]"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#1C1C24] text-white font-semibold rounded-lg border border-white/10 hover:border-[#6E8BFF]/50 transition-colors shadow-[0_0_20px_rgba(110,139,255,0.15)]"
          >
            {loading ? "Checking..." : (
              <span className="flex items-center gap-2">
                Check URL
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Validation Error */}
        {errors.url && (
          <p className="text-red-500 mt-2 text-center">
            {errors.url.message}
          </p>
        )}

        {/* API Error */}
        {error && (
          <p className="text-red-500 mt-4 text-center">
            {error}
          </p>
        )}

        {/* SCHEMA PREVIEW */}
        {schema && (
          <div className="mt-12 bg-[#1C1C24] border border-white/10 rounded-xl p-6 text-white">

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">
              {schema.metadata?.title}
            </h2>

            {/* Description */}
            {schema.metadata?.description && (
              <p className="text-gray-400 mb-4 whitespace-pre-line">
                {schema.metadata.description}
              </p>
            )}

            {/* Meta */}
            <p className="text-gray-400 mb-6">
              Platform: {schema.platform} •{" "}
              {schema.metadata?.totalFields} Questions •{" "}
              {schema.metadata?.totalRequired} Required
            </p>

            {/* Fields */}
            <div className="space-y-6">
              {schema.fields?.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-lg bg-[#0B0B0F] border border-white/5"
                >
                  <p className="font-medium mb-2">
                    {index + 1}. {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </p>

                  {/* LONG TEXT */}
                  {field.type === "LONG_TEXT" && (
                    <textarea
                      disabled
                      placeholder="User response..."
                      className="w-full mt-2 px-3 py-2 rounded-md bg-[#1C1C24] border border-white/10 text-gray-400"
                    />
                  )}

                  {/* MULTIPLE CHOICE */}
                  {field.type === "MULTIPLE_CHOICE" && field.choices && (
                    <div className="space-y-2 mt-2">
                      {field.choices.map((choice, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <input type="radio" disabled />
                          {choice.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Fallback for unknown types */}
                  {!["LONG_TEXT", "MULTIPLE_CHOICE"].includes(field.type) && (
                    <p className="text-sm text-gray-500 mt-2">
                      Field Type: {field.type}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default StartFreePage;

"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileText, CheckCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const detailedPrompt = `
You are an expert grant reader and analyst. Read the following grant document and provide a clear, easy-to-understand summary that is organized by what the user needs to respond to. Use plain language for someone who may not be familiar with legal or grant-specific jargon.

Break the analysis down into the following sections:

Eligibility Requirements

- Who can apply?
- Are there any geographic, organizational, or financial prerequisites?

Funding Details

- How much money is available?
- How many awards will be given?
- What is the funding period?
- Is it a one-time or recurring grant?

Deadlines and Key Dates

- Application due date
- Notification date
- Project start and end dates

Required Application Components

- What specific documents or materials need to be submitted?
- Are there templates or formats that must be used?
- Are there any questions or narrative sections that must be answered?

Evaluation Criteria

- How will applications be scored?
- What does the reviewer look for?

Compliance and Reporting

- What are the reporting obligations if awarded?
- Are there specific outcomes or metrics that must be tracked?
- Are there rules about how funds must be spent?

Contact and Support

- Who to contact with questions?
- Any webinars or technical support offered?

Plain-Language Summary

- In 3–5 bullet points, summarize what the applicant must do to apply and win this grant.
- Be very clear, concise, and practical—imagine you're explaining this to a first-time grant applicant. Use bold headers and bullets or short paragraphs where possible.
`


export function GrantSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState<string>(detailedPrompt)
  const [activeTab, setActiveTab] = useState<string>("default")

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
    setSummary("")
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a grant document first")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("pdf", file)

      // Add the custom prompt if using the custom tab
      if (activeTab === "custom") {
        formData.append("prompt", customPrompt)
      }

      const response = await fetch("/api/analyze-grant", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze the grant document")
      }

      const result = await response.json()
      setSummary(result.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Grant Document</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader onFileChange={handleFileChange} />

          {file && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <span className="ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}

          <div className="mt-6">
            <Tabs defaultValue="default" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="default">Default Prompt</TabsTrigger>
                <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
              </TabsList>
              <TabsContent value="default" className="mt-4">
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md border prose prose-sm whitespace-pre-wrap">
                  {detailedPrompt}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-4">
                <div className="space-y-2">
                  <label htmlFor="custom-prompt" className="text-sm font-medium">
                    Your Custom Prompt:
                  </label>
                  <Textarea
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter your custom prompt for the AI..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    Craft your prompt to get the specific information you need from the grant document.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Grant"
            )}
          </Button>
        </CardFooter>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Grant Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {summary.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

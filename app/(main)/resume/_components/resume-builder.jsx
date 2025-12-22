"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertTriangle,
    Download,
    Edit,
    Loader2,
    Monitor,
    Save,
} from "lucide-react";
// import { toast } from "sonner";
// import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { saveResume } from "@/actions/resume";
// import { EntryForm } from "./entry-form";
// import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
// import { entriesToMarkdown } from "@/app/lib/helper";
// import { resumeSchema } from "@/app/lib/schema";
// import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    useForm();

    return (
        <div className="space-x-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>

                <div className="space-x-2">
                    <Button variant="destructive">
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                    <Button >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">Make changes to your account here.</TabsContent>
                <TabsContent value="preview">Change your password here.</TabsContent>
            </Tabs>
        </div>
    );
}

export default ResumeBuilder;
// const [previewContent, setPreviewContent] = useState(initialContent);
// const { user } = useUser();
// const [resumeMode, setResumeMode] = useState("preview");

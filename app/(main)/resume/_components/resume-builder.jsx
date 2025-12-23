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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { saveResume } from "@/actions/resume";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import EntryForm from "./entry-form";
import MDEditor from "@uiw/react-md-editor";



const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    const [resumeMode, setResumeMode] = useState("preview");
    const [previewContent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);

    const { control, register, handleSubmit, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },
    });
    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError,
    } = useFetch(saveResume);

    const formValues = watch();

    useEffect(() => {
        if (initialContent) setActiveTab("preview");
    }, [initialContent]);

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues, activeTab])

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
            parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
            : "";
    };

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;

        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    };

    const onSubmit = async (data) => {

    }

    const generatePDF = async () => {
        setIsGenerating(true);
        try{
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import("html2canvas-pro"),
                import("jspdf")
            ]);
            
            const element = document.getElementById("resume-pdf");
            
            // Convert element to canvas using html2canvas-pro (supports lab colors)
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // Convert canvas to PDF
            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const pdf = new jsPDF("portrait", "mm", "a4");
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = margin;
            
            // Add first page
            pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin * 2);
            
            // Add additional pages if content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + margin;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - margin * 2);
            }
            
            pdf.save("resume.pdf");
            toast.success("PDF downloaded successfully!");
        }catch (error) {
            console.log("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="space-x-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>

                <div className="space-x-2">
                    <Button variant="destructive">
                        <Save className="h-4 w-4" />
                        Save
                    </Button>

                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4"/>
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.mobile.message}</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.linkedin.message}</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Twitter/X Profile</label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/yourprofile"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-sm text-red-500">{errors.contactInfo.twitter.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Professional Summary</h3>
                            <Controller
                                name="summary"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="Write a compelling professional summary..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Skills</h3>
                            <Controller
                                name="skills"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-sm text-red-500">{errors.skills.message}</p>
                            )}
                        </div>


                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <Controller
                                name="experience"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Experience"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-sm text-red-500">{errors.experience.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
                            <Controller
                                name="education"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Education"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-500">{errors.education.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <Controller
                                name="projects"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Projects"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-sm text-red-500">{errors.projects.message}</p>
                            )}
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="preview">
                    <Button variant="link" type="button" className="mb-2" onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}>
                        {resumeMode === "preview" ? (
                            <>
                                <Edit className="h-4 w-4" />
                                Edit Resume
                            </>
                        ) : (
                            <>
                                <Monitor className="h-4 w-4" />
                                Show Preview
                            </>
                        )}
                    </Button>

                    {resumeMode !== "preview" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                You will lose edited markdown if you update the form data.
                            </span>
                        </div>
                    )}

                    <div className="border rounded-lg">
                        <MDEditor
                            value={previewContent} 
                            onChange={setPreviewContent}
                            height={800}
                            preview={resumeMode}
                        />
                    </div>

                    <div className="hidden">
                        <div id="resume-pdf">
                            <MDEditor.Markdown 
                                source={previewContent}
                                style={{
                                    background: "white",
                                    color: "black",
                                }}                       
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ResumeBuilder;
// const [previewContent, setPreviewContent] = useState(initialContent);
// const { user } = useUser();
// const [resumeMode, setResumeMode] = useState("preview");

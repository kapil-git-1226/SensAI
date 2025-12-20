import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z
    .string({
      required_error: "Please select an industry",
    })
    .min(1, "Please select an industry"),
  subIndustry: z
    .string({
      required_error: "Please select a specialization",
    })
    .min(1, "Please select a specialization"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  experience: z
    .string({
      required_error: "Please enter years of experience",
    })
    .min(1, "Please enter years of experience")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number({
          invalid_type_error: "Experience must be a valid number",
        })
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),
  skills: z
    .string({
      required_error: "Please enter at least one skill",
    })
    .min(1, "Please enter at least one skill")
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : []
    ),
});

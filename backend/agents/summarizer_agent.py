import logging
from typing import Dict, Any, Optional
from backend.services.lyzr_agent_framework import lyzr_framework

logger = logging.getLogger("voicestudy.summarizer_agent")

SUMMARIZER_INSTRUCTIONS = """You are the Summarizer Agent for VoiceStudy AI, specialized in Meeting & Lecture Intelligence.
Your objective is to analyze meeting or lecture voice transcripts and generate highly structured, organized study notes that preserve the exact factual meaning of the student's supplied content.

Structure your response using clean, readable markdown:
### Lecture Overview
[A concise 2-3 sentence overview of the core topic, context, and purpose]

### Key Concepts & Definitions
- **[Concept 1]**: [Clear, precise definition based strictly on the lecture content]
- **[Concept 2]**: [Clear, precise definition based strictly on the lecture content]
- **[Concept 3]**: [Clear, precise definition based strictly on the lecture content]

### Detailed Concept Breakdown
[Explain the core mechanisms, steps, or principles presented in the lecture using bullet points or numbered lists]

### Practical Examples & Applications
- **[Example 1]**: [Practical scenario, code pattern, or concrete application mentioned in lecture]

### Summary & Revision Takeaways
- [Primary takeaway for exam/study review]
- [Secondary takeaway or common pitfall to avoid]

Guidelines:
1. Stay strictly faithful to the transcript content; do not extrapolate, invent facts, or hallucinate external information.
2. Keep the formatting structured, clear, and easy for students to revise.
3. If the transcript is brief or conversational, synthesize what is present accurately without adding fictional details.
"""

class SummarizerAgent:
    def __init__(self):
        self.name = "Summarizer Agent"

    def summarize_transcript(
        self,
        transcript: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        logger.info(f"Summarizer Agent processing transcript of {len(transcript)} chars")

        prompt_parts = []
        if context:
            prompt_parts.append(f"SESSION CONTEXT:\n{context}\n")
        prompt_parts.append(f"TRANSCRIPT TO SUMMARIZE:\n{transcript}\n\nPlease generate a clear, structured summary of key points.")

        full_prompt = "\n".join(prompt_parts)

        response_text = lyzr_framework.execute_agent_prompt(
            agent_name="Summarizer",
            system_instructions=SUMMARIZER_INSTRUCTIONS,
            user_input=full_prompt,
            temperature=0.2
        )

        return {
            "summary": response_text,
            "agent_executed": self.name,
            "length_processed": len(transcript)
        }

summarizer_agent = SummarizerAgent()

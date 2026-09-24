/**
 * ==============================================================================
 * PRODUCT CONFIGURATION
 * ==============================================================================
 */

export interface CurriculumTopic {
  number: number;
  title: string;
  description: string;
}

export const PRODUCT_CONFIG = {
  // IMPORTANT: The title below is intentionally verbatim as specified.
  title: 'Artificial Intelligence - An brief overview for beginners',
  subtitle: 'A concise, beginner-friendly introduction to modern Artificial Intelligence, Machine Learning, and Large Language Models.',
  priceDisplay: '₹23',
  priceAmount: 23,
  currency: 'INR',
  pricingType: 'One-time purchase',
  buttonText: 'Buy & Download – ₹23',
  format: 'Digital PDF Guide',
  delivery: 'Instant Secure Download',
  language: 'English',
  targetAudience: 'Beginners & Enthusiasts',
  
  whatYouWillLearn: [
    {
      number: 1,
      title: 'AI & Machine Learning Foundations',
      description: 'Understanding the Landscape, Training Data & Models',
    },
    {
      number: 2,
      title: 'Large Language Models (LLMs)',
      description: 'Core Engine, Transformer Architecture, Prompt Engineering',
    },
    {
      number: 3,
      title: 'Data Processing: Chunks & Embeddings',
      description: 'Tokenization, Text Chunking, Understanding Vectors',
    },
    {
      number: 4,
      title: 'Vector Storage & Retrieval',
      description: 'Vector Databases, Similarity Search (Cosine Similarity)',
    },
    {
      number: 5,
      title: 'Retrieval-Augmented Generation (RAG)',
      description: 'Connecting Data to LLMs, Workflow & Frameworks (LangChain)',
    },
    {
      number: 6,
      title: 'AI Agents & Tool Calling',
      description: 'Agent Autonomy, Function Calling, Reasoning Frameworks',
    },
  ] as CurriculumTopic[],
};

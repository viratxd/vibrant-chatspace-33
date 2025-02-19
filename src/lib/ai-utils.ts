
const API_BASE_URL = 'https://deepak191z-tst.hf.space/v1';
const OCR_API_URL = 'https://deepak191z-ocr.hf.space/api/ocr';

export class ChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatError';
  }
}

export async function sendMessage(content: string, replyToContent?: string): Promise<Response> {
  try {
    // Combine replyToContent and user input if reply exists
    const finalContent = replyToContent
      ? `${replyToContent}\n\n${content}`
      : content;

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: finalContent,
          },
        ],
        model: 'gpt-4o-mini',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new ChatError(`Server error: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError('Failed to connect to chat service');
  }
}

export async function processImage(imageFile: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new ChatError('Failed to process image');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    throw new ChatError('Failed to process image');
  }
}

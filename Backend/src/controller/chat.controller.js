import { chatWithMistralAiModel } from "../services/ai.service.js";

export async function sendMessageController(req, res, next) {
    try {
        const { message } = req.body
        const response = await chatWithMistralAiModel({ message })

        res.status(200).json(
            {
                success: true,
                message: 'Message sent',
                AiMessage: response
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });

    }
}


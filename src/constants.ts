import { Language } from './types';

export const LANGUAGES = [
  Language.ENGLISH,
  Language.TIBETAN,
  Language.HAWAIIAN,
  Language.TELUGU,
];

export const FREE_MESSAGE_LIMIT = 1000;
export const GUEST_CHAT_LIMIT = 500;

export const UI_TEXT: { [key in Language]: { [key: string]: string } } = {
  [Language.ENGLISH]: {
    title: 'EduGlobe AI',
    slogan: 'Expanding AI Education to New Audiences',
    languageSelectorHeader: 'Language',
    chatHistoryHeader: 'Chat History',
    newChatButton: 'New Chat',
    deleteChatButton: 'Delete Current Chat',
    loginButton: 'Login',
    logoutButton: 'Logout',
    welcomeHeader: 'Welcome to EduGlobe AI',
    welcomeMessage: 'Select a language and ask a math question to begin. Ask for practice problems or a quiz as well.',
    chatPlaceholder: 'Please enter your math question. Use clear, direct language.',
    limitReachedMessage: 'You have reached your free usage limit.',
    limitReachedPlaceholder: 'You have reached the free limit. Please log in to continue.',
    errorMessage: "Sorry, I couldn't get a response. Please try again.",
  },
  [Language.TIBETAN]: {
    title: 'ཨེ་ཌུ་གློབ་ AI',
    slogan: 'AI སློབ་གསོ་རྒྱ་བསྐྱེད་གཏོང་བ།',
    languageSelectorHeader: 'སྐད་ཡིག',
    chatHistoryHeader: 'ཁ་བརྡའི་ལོ་རྒྱུས།',
    newChatButton: 'ཁ་བརྡ་གསར་པ།',
    deleteChatButton: 'ད་ལྟའི་གླེང་མོལ་སུབ་པ།',
    loginButton: 'ནང་འཛུལ།',
    logoutButton: 'ཕྱིར་ཐོན།',
    welcomeHeader: 'ཨེ་ཌུ་གློབ་ AI ལ་ཕེབས་པར་དགའ་བསུ་ཞུ།',
    welcomeMessage: 'སྐད་ཡིག་འདེམས་ནས་ཨང་རྩིས་ཀྱི་དྲི་བ་ཞིག་དྲིས་ནས་འགོ་འཛུགས་དགོས། ལག་ལེན་གྱི་དཀའ་ངལ་ཡང་ན་དྲི་བ་དྲིས་དགོས།',
    chatPlaceholder: 'འདིར་རྩིས་ཀྱི་དྲི་བ་འགོད་རོགས། ရှင်းབསྡུས་ཐད་ཀར་གྱི་སྐད་ཆ་བེད་སྤྱོད་གནང་རོགས།',
    limitReachedMessage: 'ཁྱེད་ཀྱིས་རིན་མེད་བེད་སྤྱོད་ཀྱི་ཚད་ལ་སླེབས་འདུག',
    limitReachedPlaceholder: 'ཁྱེད་ཀྱིས་རིན་མེད་བེད་སྤྱོད་ཀྱི་ཚད་ལ་སླེབས་འདུག ནང་འཛུལ་བྱས་ནས་མུ་མཐུད་དུ་བེད་སྤྱོད་གནང་རོགས།',
    errorMessage: "དགོངས་དག ལན་ཞིག་འཚོལ་མ་ཐུབ་སོང་།",
  },
  [Language.HAWAIIAN]: {
    title: 'EduGlobe AI',
    slogan: 'Hoʻonui i ka Hoʻonaʻauao AI i nā Poʻe Hou',
    languageSelectorHeader: 'ʻŌlelo',
    chatHistoryHeader: 'Moʻolelo Kūkā',
    newChatButton: 'Kūkā Hou',
    deleteChatButton: 'Holoi i ke Kūkākūkā o kēia manawa',
    loginButton: 'ʻEʻe',
    logoutButton: 'Haʻalele',
    welcomeHeader: 'Welina mai i EduGlobe AI',
    welcomeMessage: 'E koho i kahi ʻōlelo a nīnau i kahi nīnau makemakika e hoʻomaka ai.',
    chatPlaceholder: 'E hoʻokomo i kāu nīnau makemakika. E hoʻohana i ka ʻōlelo akaka a pololei.',
    limitReachedMessage: 'Ua hiki ʻoe i kou palena hoʻohana manuahi.',
    limitReachedPlaceholder: 'Ua hiki ʻoe i kou palena. E ʻeʻe e hoʻomau.',
    errorMessage: "E kala mai, ʻaʻole hiki iaʻu ke loaʻa kahi pane. E ʻoluʻolu e hoʻāʻo hou.",
  },
  [Language.TELUGU]: {
    title: 'ఎడ్యుగ్లోబ్ AI',
    slogan: 'AI విద్యను కొత్త ప్రేక్షకులకు విస్తరించడం',
    languageSelectorHeader: 'భాష',
    chatHistoryHeader: 'చాట్ చరిత్ర',
    newChatButton: 'కొత్త చాట్',
    deleteChatButton: 'ప్రస్తుత చాట్‌ను తొలగించండి',
    loginButton: 'లాగిన్',
    logoutButton: 'లాగ్ అవుట్',
    welcomeHeader: 'ఎడ్యుగ్లోబ్ AIకి స్వాగతం',
    welcomeMessage: 'ప్రారంభించడానికి ఒక భాషను ఎంచుకుని, గణిత ప్రశ్నను అడగండి.',
    chatPlaceholder: 'దయచేసి మీ గణిత ప్రశ్నను నమోదు చేయండి. స్పష్టమైన, ప్రత్యక్ష భాషను ఉపయోగించండి.',
    limitReachedMessage: 'మీరు మీ ఉచిత వినియోగ పరిమితిని చేరుకున్నారు.',
    limitReachedPlaceholder: 'మీరు ఉచిత పరిమితిని చేరుకున్నారు. దయచేసి కొనసాగించడానికి లాగిన్ అవ్వండి.',
    errorMessage: "క్షమించండి, నేను ప్రతిస్పందనను పొందలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },
};

const TIBETAN_SYSTEM_PROMPT = `You are a culturally aware educational assistant (that uses fact not stereotypes) that explains elementary and middle school math concepts using Tibetan cultural metaphors and visuals.
Whenever a user asks about a math concept:
1. Analyze the user's input message.
2. Check whether the input contains any words or phrases from the alias listed below.
3. If a match is found, map the user's input to the corresponding canonical math concept label (e.g., "place_value", "fractions", "symmetry").
2. Once the concept is identified, proceed to generate an appropriate explanation using the matched concept's logic, cultural metaphor.
3. Write a child-friendly explanation combining the math idea and the cultural metaphor.
4. Create an image generation prompt that illustrates the math concept using the chosen cultural element. The image should be clear, age-appropriate, and educational.

Example:
- If a user says, "Which side is longer?", detect the phrase "longer" as part of the "compare_order_numbers" group.
- If a user says, "How much space does it take up?", detect this as part of "perimeter_area".

If multiple synonyms from different categories appear, choose the most dominant or relevant match based on context.

Avoid structured JSON formatting. Write naturally like a tutor or friend, but still include the metaphor and visual hint.
If the concept is uncommon or not pre-mapped, intelligently select another appropriate Tibetan object or practice that fits the logic or shape of the math idea.

You can choose to return any one (better to include both):
- A textual explanation
- A corresponding image prompt (to be passed to an image generation model like DALL·E or Stable Diffusion)
Data Sets:
This dataset defines a structured mapping between mathematical concepts and Tibetan cultural elements. It is designed to train or guide an AI assistant to explain elementary and middle school math using culturally relevant metaphors from Tibetan traditions.
The intended users are students aged 8–15, and the goal is to make mathematical learning more engaging, grounded, and locally meaningful.
Each entry includes:
Concept: The core mathematical idea (in English)
Aliases: any words in this list, if detected, will be treated as the concept as well.
tibetan_culture: A corresponding Tibetan cultural object, pattern, practice, or symbol
Explanation prompt: A child-friendly explanation that connects the math concept to the cultural metaphor

Conversation Examples:
Example 1: Function + Khata (natural response)
User:
"What’s a function?"
AI:
 Sure! A function is like giving one special scarf — called a Khata — to each guest who visits. Every guest gets one scarf, no more, no less. That’s just like in math: a function gives exactly one output for each input.
👉 A fun picture would be a group of people lined up, each happily receiving a colorful Khata scarf from a host. The people could be labeled “input,” and the scarves “output.” That would show the idea really clearly!
Example 2: Area + Mandala (natural response)
User:
“What does area mean?”
AI:
 Great question! Area is the space something takes up. Imagine a Tibetan Mandala — those beautiful circular artworks. The more layers or rings you draw in the Mandala, the bigger it gets. That extra space is just like adding more area!
👉 I’d draw a Mandala growing from the center outwards in colorful rings, with little notes showing how much each ring adds to the total area.

Example 3: Probability + Wind Horse Flags (free style)
User:
"I don’t get what probability means..."
AI:
 Probability is like guessing which color Wind Horse prayer flag will flap first in the wind. You can't know for sure — maybe the red one moves first, maybe blue. That uncertainty is what probability is all about!
👉 A nice picture could be a string of flags blowing in the wind, each with a little “chance” number above it, like 30%, 50%, 20%, showing how likely they are to move first.`;

export const SYSTEM_PROMPTS: { [key in Language]: string } = {
  [Language.ENGLISH]: 'You are a friendly and encouraging math tutor for elementary and middle school students. Explain concepts simply, step-by-step, and clearly. Use simple analogies if they help.',
  [Language.TIBETAN]: TIBETAN_SYSTEM_PROMPT,
  [Language.HAWAIIAN]: 'You are a helpful math tutor who explains concepts using Hawaiian culture and nature as metaphors. For example, you can use ideas like navigating by the stars (geometry), counting fish (arithmetic), or the patterns on kapa cloth (symmetry). Keep it simple and engaging for a young audience.',
  [Language.TELUGU]: 'You are a supportive math teacher who uses examples from Indian culture, particularly from Telugu-speaking regions, to explain math. You can reference things like temple architecture (geometry), cooking measurements (fractions), or kolam patterns (symmetry). Make your explanations clear and relatable for students.',
};

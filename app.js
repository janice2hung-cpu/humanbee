/*
 * Media Heroes — client-side interactive story
 * All story progress is kept in browser history state, so the in-app back
 * control and the browser's Back command restore the exact earlier scene.
 */

const icons = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m8.4 12 2.25 2.25L15.9 9"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
  amy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7.5" r="3.25"/><path d="M5.5 21v-1.1a6.5 6.5 0 0 1 13 0V21"/><path d="M5.6 4.8a7.7 7.7 0 0 1 12.8 0"/></svg>`,
  social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20v-1.25a5 5 0 0 1 5-5h1.5a5 5 0 0 1 5 5V20"/><circle cx="9.75" cy="7" r="3.25"/><path d="M16.5 9.2a2.45 2.45 0 1 0 0-4.9"/><path d="M17.6 13.7a4.05 4.05 0 0 1 3.4 4V20"/></svg>`,
  bystander: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="2.6"/><circle cx="16.5" cy="8" r="2.6"/><path d="M3.5 20v-1.1a4.5 4.5 0 0 1 4.5-4.5h.1a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="M12.2 15.2a4.4 4.4 0 0 1 3.8-2.2h.5a4 4 0 0 1 4 4V20"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7h.01"/></svg>`,
};

const initialGame = () => ({
  actions: [],
  pending: null,
});

let game = initialGame();
let currentSceneId = "home";
let toastTimer;
let language = localStorage.getItem("mediaHeroesLanguage") === "en" ? "en" : "zh-Hant";

const translations = {
  "Amy 視角": "Amy's perspective",
  "學校社工視角": "School social worker's perspective",
  "旁觀者視角": "Bystander's perspective",
  "校園像素畫：Amy 在課室裡看見手機班群中的未經同意照片，感到不安。": "Pixel-art school scene: Amy notices an unauthorised photo in the class chat and feels uneasy.",
  "校園像素畫：手機班群顯示一張 Amy 的尷尬照片和抽象訊息泡泡，Amy 在課室裡擔心地看著手機。": "Pixel-art school scene: The class chat shows an embarrassing photo of Amy and abstract message bubbles as she looks worried at her phone.",
  "校園像素畫：Amy 在走廊中看著手機上的抽象限時動態式謠言畫面，遠處有同學在交談。": "Pixel-art school scene: Amy looks at a rumour on her phone in the corridor while students talk in the background.",
  "校園像素畫：Amy 在社工室向學校社工展示手機上的班群內容，社工安靜聆聽。": "Pixel-art school scene: Amy shows the class-chat content on her phone to the school social worker, who listens quietly.",
  "校園像素畫：Amy 在社工室說明手機上的兩類網絡內容，社工平靜地聆聽。": "Pixel-art school scene: Amy explains two kinds of online content in the social worker's office while the worker listens calmly.",
  "校園像素畫：社工放下筆、以開放姿勢再次聆聽 Amy，兩人在安靜的社工室交談。": "Pixel-art school scene: The social worker puts down a pen and listens to Amy again with an open posture in a quiet office.",
  "校園像素畫：Amy 與學校社工一起查看有盾牌、對話和私隱圖示的支援計劃。": "Pixel-art school scene: Amy and the school social worker review a support plan with shield, conversation and privacy icons.",
  "校園像素畫：Amy 看見螢幕上多個抽象轉發和通知圖示，社工注意到她的不安。": "Pixel-art school scene: Amy sees forwarding and notification icons on a screen; the social worker notices her unease.",
  "校園像素畫：放學後的空走廊裡，Amy 獨自看著不斷亮起通知的手機。": "Pixel-art school scene: After school, Amy looks alone at her phone as notifications keep lighting up.",
  "校園像素畫：社工以手勢暫停走廊中的面對面談話，Amy 顯得緊張但受到保護。": "Pixel-art school scene: The social worker gestures to pause a face-to-face conversation in the corridor; Amy looks nervous but protected.",
  "校園像素畫：一名旁觀同學在手機前停下轉發動作，遠處有可求助的老師。": "Pixel-art school scene: A bystander stops before forwarding something on a phone; a teacher who can help is visible in the distance.",
  "Media Heroes 學習提示｜先保護自己，再尋找支持": "Media Heroes learning point | Protect yourself first, then seek support",
  "保存有需要的資料，毋須把傷害內容再傳給更多人。": "Keep any information you may need. You do not need to send harmful content to more people.",
  "不以報復或再轉發回應，減少二次傳播。": "Do not retaliate or forward the content again; help prevent further spread.",
  "可封鎖、舉報有害帳戶或內容，並向可信任的成年人求助。": "You can block or report harmful accounts or content, and seek help from a trusted adult.",
  "當網絡內容令人受傷時，得到支持不代表要獨自證明一切；可以一步一步處理。": "When online content causes harm, receiving support does not mean you have to prove everything alone. You can take things one step at a time.",
  "Media Heroes 學習提示｜Responding to a disclosure": "Media Heroes learning point | Responding to a disclosure",
  "Stay calm：保持冷靜，避免倉促行動。": "Stay calm: Avoid rushing into action.",
  "Listen with empathy：以同理心聆聽 Amy 所經歷的事件和感受。": "Listen with empathy: Hear what Amy has experienced and how she feels.",
  "Treat with respect and be supportive：以尊重的態度支持她，不責備、不淡化她的經歷。": "Treat with respect and be supportive: Support her respectfully. Do not blame her or minimise her experience.",
  "Check safety concerns：了解她是否有安全上的憂慮，以及事件是否仍在持續。": "Check safety concerns: Find out whether she has any safety concerns and whether the incident is ongoing.",
  "被傾聽與被尊重，往往是披露後最重要的第一步。這些是支援者可參考的回應原則；實際跟進仍應按情況、學校程序及專業判斷處理。": "Being heard and respected is often the most important first step after a disclosure. These are response principles for supporters to consider; follow-up should be guided by the situation, school procedures and professional judgement.",
  "Media Heroes 學習提示｜犯錯後，仍可重新聆聽": "Media Heroes learning point | Listening again after a mistake",
  "承認自己剛才的回應沒有接住對方，而不是為自己辯解。": "Acknowledge that your earlier response did not meet the person's needs, rather than making excuses.",
  "真誠道歉，重新把焦點放回 Amy 的感受與安全。": "Offer a sincere apology and bring the focus back to Amy's feelings and safety.",
  "讓 Amy 知道她可按自己的步伐說下去，也可一起商量下一步。": "Let Amy know she can speak at her own pace and that you can discuss the next step together.",
  "修正不會抹去已造成的感受，但能讓對話重新有安全的空間。": "Repairing the conversation does not erase the hurt, but it can make the space feel safe again.",
  "Media Heroes 學習提示｜一起作決定": "Media Heroes learning point | Making decisions together",
  "先了解事件是否仍在持續，以及 Amy 此刻的安全需要。": "First find out whether the incident is ongoing and what Amy needs for her safety right now.",
  "整理所需資料、商討舉報和封鎖，避免額外轉發傷害內容。": "Organise relevant information and discuss reporting and blocking, without forwarding harmful content further.",
  "在可行範圍內讓 Amy 參與決定，尊重她的私隱和意願。": "Where possible, involve Amy in decisions and respect her privacy and wishes.",
  "好的支持不是代替當事人作所有決定，而是讓她在安全的情況下重新擁有選擇。": "Good support does not mean making every decision for the person. It helps them regain choice in a safe way.",
  "Media Heroes 學習提示｜修正介入方式": "Media Heroes learning point | Adjusting the response",
  "暫停會增加壓力或曝光的做法，先說明和道歉。": "Pause actions that may increase pressure or exposure; explain what happened and apologise first.",
  "重新評估安全、私隱和 Amy 的準備程度。": "Reassess safety, privacy and Amy's readiness.",
  "以最少披露和共同商討的方式，逐步連結合適支持。": "Gradually connect her with appropriate support through minimal disclosure and shared discussion.",
  "不同情況未必有單一處理方法；重要的是不把當事人的意願和安全放到最後。": "There may not be one single response for every situation. The important thing is not to put the person's wishes and safety last.",
  "Media Heroes 學習提示｜旁觀者也能減少傷害": "Media Heroes learning point | Bystanders can also reduce harm",
  "不轉發、不起哄，也不把有害內容當作談資。": "Do not forward, encourage the behaviour or treat harmful content as gossip.",
  "私下關心受影響的人，讓她知道不是孤身一人。": "Check in privately with the person affected and let them know they are not alone.",
  "把需要的資料交給能提供協助的可信任成年人，而非再傳到其他群組。": "Share necessary information with a trusted adult who can help, rather than sending it to more group chats.",
  "旁觀者不需要獨自與所有人對抗；選擇不傳播並連結支持，已能改變群組文化。": "Bystanders do not have to confront everyone alone. Choosing not to spread content and connecting someone with support can change the group culture.",
  "課堂互動故事": "Interactive classroom story",
  "Media Heroes\\n數碼世界守護者": "Media Heroes\\nGuardians of the Digital World",
  "從不同角色的眼睛，練習看見網絡欺凌帶來的影響，以及能夠建立支持網的每一個選擇。": "See the impact of cyberbullying through different perspectives, and explore the choices each person can make to build a network of support.",
  "這是一個以香港校園情境設計的互動故事。你將先後成為 Amy、學校社工及旁觀者，親身經過同一件事的不同位置。": "This interactive story is designed around a Hong Kong school setting. You will take the perspectives of Amy, a school social worker and a bystander, experiencing different positions in the same incident.",
  "故事中的選擇會呈現可能帶來的後果；它不是評分測驗，也不取代學校的既定程序或專業判斷。": "The choices in this story show possible consequences. This is not a scored quiz and does not replace established school procedures or professional judgement.",
  "視角一 · 受事件影響的人": "Perspective 1 · The person affected",
  "你現在是 Amy": "You are Amy",
  "你剛發現，一張未經你同意的照片正在班級群組流傳。此刻最重要的，不是獨自承受。": "You have just discovered that a photo shared without your consent is circulating in the class group chat. The most important thing now is that you do not have to face this alone.",
  "接下來的選擇會影響內容是否繼續擴散、你是否得到支持，以及你對事情的掌控感。": "Your choices may affect whether the content continues to spread, whether you receive support and how much control you feel you have over the situation.",
  "從 Amy 的位置出發：先照顧自己、避免讓傷害內容再擴散，並想想可以向誰求助。": "From Amy's perspective: look after yourself, avoid spreading harmful content further and think about whom you can ask for help.",
  "以 Amy 身分開始": "Continue as Amy",
  "WhatsApp 群組的黑圖": "An embarrassing photo in the WhatsApp group",
  "某天，你發現班上的 WhatsApp group 突然變得非常熱鬧。": "One day, you notice that the class WhatsApp group has suddenly become very active.",
  "原來，有同學未經 Amy 同意，將她的「黑圖」上傳到群組，並加上侮辱性的文字。其他同學開始取笑 Amy，有人甚至把照片轉發到其他群組。": "Someone has uploaded an embarrassing photo of Amy to the group without her consent, adding insulting words. Other students begin mocking Amy, and some even forward the photo to other groups.",
  "Amy 發現後感到非常難過，也開始害怕回到學校。": "After discovering this, Amy feels deeply upset and starts to dread going back to school.",
  "群組訊息不斷彈出：有人取笑照片，也有人說「再 send 畀其他人睇」。": "Messages keep popping up in the group: some students mock the photo, while others say, “Send it to more people.”",
  "如果你是 Amy，此刻會怎樣做？": "If you were Amy, what would you do?",
  "我立即在群組反擊，辱罵那些取笑我的同學，讓他們也感受被羞辱的滋味。": "I would immediately fight back in the group and insult the students who mocked me, so they would know what humiliation feels like.",
  "公開反擊或會令更多人加入爭論。內容被不斷截圖、轉發，事件可能更快擴散。": "Public retaliation may draw more people into the argument. The content may be screenshotted and forwarded repeatedly, causing the incident to spread faster.",
  "我甚麼都不做，立即退出群組，假裝這件事沒有發生。": "I would do nothing, leave the group immediately and pretend this never happened.",
  "暫時離開群組可讓 Amy 喘一口氣，但照片仍可能流傳；她也仍然要獨自面對壓力。": "Leaving the group temporarily may give Amy some breathing space, but the photo may continue circulating and she would still be facing the pressure alone.",
  "我先保存群組對話及照片作為證據，封鎖及舉報相關帳戶，並向信任的老師或家人求助。": "I would first save the group messages and photo as evidence, block and report the relevant accounts, and seek help from a teacher or family member I trust.",
  "Amy 沒有再轉發傷害內容，並保存了資料、尋求可信任成人協助。她不必一個人處理。": "Amy does not forward the harmful content again. She saves the information and seeks help from a trusted adult. She does not have to handle this alone.",
  "保存資料並及早求助": "Save information and seek help early",
  "我把照片轉發到其他群組，讓更多人知道有人欺負我，希望大家幫我討回公道。": "I would forward the photo to other groups so more people know I am being bullied and can help me get justice.",
  "即使 Amy 想獲得支持，轉發同一張照片也會令更多人看見它，形成二次傳播。": "Even if Amy wants support, forwarding the same photo means more people will see it, creating further circulation and exposure.",
  "Instagram 上的緋聞謠言": "Rumours in an Instagram Story",
  "因為事情沒有得到合適處理，情況開始變得更加嚴重。": "Because the situation has not been addressed appropriately, it begins to get worse.",
  "第二天，Amy 回到學校，發現更多同學看過她的黑圖，甚至有人在走廊上偷偷議論她。": "The next day, Amy returns to school and discovers that more students have seen her embarrassing photo. Some are even whispering about her in the corridor.",
  "她打開 Instagram，發現有同學在限時動態發布關於她的謠言；有人正在回覆、轉發，還在留言中取笑她。Amy 感到尷尬、憤怒和難過，擔心更多人會相信不實消息。": "She opens Instagram and finds that a student has posted rumours about her in a Story. Others are replying, forwarding it and mocking her in the comments. Amy feels embarrassed, angry and upset, and worries that more people will believe the false information.",
  "「聽講 Amy 同班上某個男同學有一腿喎！佢哋係咪已經秘密拍拖？😂」": "“I heard Amy is involved with a boy in her class! Are they secretly dating already? 😂”",
  "如果你是 Amy，你會怎樣做？": "If you were Amy, what would you do?",
  "立即在 Instagram 限時動態公開反擊，直接點名辱罵散播謠言的同學。": "I would immediately post a public response in my Instagram Story, naming and insulting the students spreading the rumour.",
  "互相指責可能令更多同學圍觀和截圖。事件得到更多注意，Amy 的壓力也可能上升。": "Trading accusations may attract more students who will watch and take screenshots. The incident may receive more attention and Amy's stress may increase.",
  "先保存限時動態及相關留言作為證據，不轉發謠言；舉報、封鎖相關帳戶，並向可信任的老師或學校社工求助。": "I would first save the Story and relevant comments as evidence, avoid forwarding the rumour, report and block the relevant accounts, and seek help from a trusted teacher or school social worker.",
  "Amy 保存了較完整的資料，沒有再擴散謠言，也主動連結到支持。": "Amy saves more complete information, does not spread the rumour further and connects with support.",
  "不轉發謠言，保存資料並求助": "Do not forward the rumour; save information and seek help",
  "甚麼都不做，假裝沒有看見，亦不向任何人透露事件，希望過幾日大家便會忘記。": "I would do nothing, pretend I had not seen it and tell no one, hoping everyone would forget in a few days.",
  "Amy 避開了當下的衝突，但謠言仍可能持續流傳；獨自承受會令壓力越積越多。": "Amy avoids an immediate confrontation, but the rumour may continue circulating. Facing the situation alone may cause her stress to build.",
  "視角二 · 支援者": "Perspective 2 · The supporter",
  "你現在是學校社工": "You are the school social worker",
  "Amy 在事情剛開始時便主動求助。你掌握到的是 WhatsApp 群組黑圖事件。": "Amy seeks help soon after the incident begins. What you know so far is the embarrassing-photo incident in the WhatsApp group.",
  "你的任務不是立刻判斷、責備，或代替 Amy 決定。先讓她感到被聆聽、被理解，再了解她目前的安全需要。": "Your task is not to judge or blame immediately, or to make decisions on Amy's behalf. First help her feel heard and understood, then explore her current safety needs.",
  "由支援者角度出發：冷靜聆聽、尊重感受及私隱，並一起想下一步。": "From the supporter's perspective: listen calmly, respect her feelings and privacy, and consider the next step together.",
  "以學校社工身分繼續": "Continue as the school social worker",
  "Amy 前來求助時，黑圖和謠言都已出現。她很害怕事件會繼續傳開。": "By the time Amy seeks help, both the embarrassing photo and rumours have appeared. She is very afraid that the content will continue to spread.",
  "接收 Amy 的求助": "Receiving Amy's request for help",
  "某天下午，Amy 主動來到你的辦公室，說最近在網絡上受到欺凌。": "One afternoon, Amy comes to your office voluntarily and says that she has recently been bullied online.",
  "她向你展示 WhatsApp 群組中被公開的黑圖。": "She shows you the embarrassing photo that has been posted in the WhatsApp group.",
  "Amy 看起來十分緊張，說完後低下頭，似乎不太願意繼續說下去。": "Amy looks very nervous. After speaking, she lowers her head and seems reluctant to continue.",
  "「姑娘，我真係唔知點算……我啲黑圖而家 send 到滿天飛。我而家好驚返學，成日都覺得有人笑緊我。」": "“I really don't know what to do… My embarrassing photo is being sent everywhere. I'm scared to go to school, and I keep feeling that people are laughing at me.”",
  "作為學校社工，你會怎樣回應 Amy？": "As the school social worker, how would you respond to Amy?",
  "責備 Amy，問佢有冇諗過點解其他人唔蝦、淨係蝦你一個，有冇喺自己身上面搵原因。": "Blame Amy and ask why other people are not bullied, why she is the only one being picked on, and whether she should look for the reason in herself.",
  "把責任放回 Amy 身上，會令她感到被責怪和更不願意說下去。這段關係仍有機會修復。": "Putting the responsibility back on Amy may make her feel blamed and less willing to continue. The relationship may still be repaired.",
  "告訴 Amy：「船到橋頭自然直，呢啲小事你唔使咁緊張，過幾日就會冇事。」": "Tell Amy: “Things will work out somehow. This is a small matter; don't be so worried. It will be over in a few days.”",
  "淡化她的經歷可能令 Amy 覺得不被相信，也錯失了解她安全和壓力的機會。這段關係仍有機會修復。": "Minimising her experience may make Amy feel disbelieved and miss the opportunity to understand her safety and stress. The relationship may still be repaired.",
  "保持冷靜，耐心聆聽 Amy 的經歷及感受，表達理解和支持，並進一步了解她目前的安全情況及事件是否仍在持續。": "Stay calm, listen patiently to Amy's experience and feelings, show understanding and support, and explore her current safety and whether the incident is ongoing.",
  "Amy 感到被接住。先聆聽和了解安全需要，能讓她更有空間參與下一步的決定。被傾聽與被尊重，往往是披露後最重要的第一步。": "Amy feels supported. Listening first and understanding her safety needs gives her more room to take part in deciding what happens next. Being heard and respected is often the most important first step after a disclosure.",
  "耐心聆聽並了解安全需要": "Listen patiently and explore safety needs",
  "某天下午，Amy 主動來到你的辦公室，向你表示最近在網絡上受到欺凌。": "One afternoon, Amy comes to your office voluntarily and tells you that she has recently been bullied online.",
  "她向你展示 WhatsApp 群組中的黑圖，以及 Instagram 上散播她與男同學緋聞的限時動態。": "She shows you the embarrassing photo in the WhatsApp group, as well as an Instagram Story spreading rumours about her and a boy in her class.",
  "Amy 看起來十分緊張。她怕更多人看見，也不知道還會不會有人繼續傳出去。": "Amy looks very nervous. She is afraid that more people will see the content and does not know whether others will continue forwarding it.",
  "「老師，我真係唔知點算……好多人都睇過啲相同謠言，返到學校又有人笑我。我而家好驚返學。」": "“I really don't know what to do… So many people have seen the photos and rumours. People laugh at me at school, and I'm scared to go back.”",
  "重新建立對話的空間": "Rebuilding space for dialogue",
  "Amy 聽完後沉默了一會兒，聲音更小了。": "After hearing this, Amy falls silent for a moment and speaks more quietly.",
  "她的反應提醒你：剛才的說話沒有好好接住她。支援者也會犯錯，重要的是能否承認、修正和重新聆聽。": "Her reaction reminds you that your earlier words did not make her feel heard. Supporters can make mistakes; what matters is whether they can acknowledge, repair and listen again.",
  "「算啦，可能真係我自己有問題……我唔想再講喇。」": "“Forget it. Maybe something really is wrong with me… I don't want to talk any more.”",
  "你會如何回應，讓 Amy 有機會重新感到安全？": "How would you respond to help Amy feel safe enough to continue?",
  "承認自己剛才太快判斷，向 Amy 道歉；重新聆聽，告訴她不需要一個人承受，並先了解她現在是否安全。": "Acknowledge that you judged too quickly, apologise to Amy, listen again, reassure her that she does not have to face this alone and first check whether she is safe now.",
  "真誠承認和修正，不能抹去剛才的感受，卻可以讓 Amy 慢慢重拾一些安全感和選擇權。": "A sincere acknowledgement and repair cannot erase the earlier hurt, but they can help Amy gradually regain some sense of safety and choice.",
  "承認失誤並重新聆聽": "Acknowledge the mistake and listen again",
  "說：「如果你唔想講，我都幫唔到你。」然後結束談話。": "Say, “If you don't want to talk, I can't help you,” and end the conversation.",
  "這會把求助的責任再次放在 Amy 身上。她離開時更孤單，也可能不再願意向成年人求助。": "This places the responsibility for seeking help back on Amy. She leaves feeling more alone and may no longer be willing to seek help from adults.",
  "一起商討下一步": "Discussing the next step together",
  "因為你保持冷靜、耐心聆聽並尊重 Amy 的感受，你和 Amy 已初步建立信任；她願意繼續披露自己的情況。你知道事件仍有被轉發的情況，而 Amy 最近不太願意上學。": "Because you stayed calm, listened patiently and respected Amy's feelings, you have begun to build trust. She is willing to share more. You learn that the content is still being forwarded and that Amy has recently become reluctant to attend school.",
  "Amy 希望內容停止流傳，但也擔心事件被更多人知道。現在需要在安全、證據、私隱和她的意願之間，和她一起找合適的下一步。": "Amy wants the content to stop circulating, but she is also worried that more people will find out. You need to work with her to find an appropriate next step while considering safety, evidence, privacy and her wishes.",
  "每個選項都會帶來不同的後果；你會怎樣開始？": "Each option may have different consequences. How would you begin?",
  "作為支援者，你會採取哪一種跟進方式？": "As the supporter, which follow-up approach would you take?",
  "和 Amy 一起整理及保存資料、了解事件是否仍在持續，評估安全需要，再商討舉報、封鎖和校內支援等安排。": "Organise and save information with Amy, find out whether the incident is ongoing, assess safety needs, and then discuss reporting, blocking and school support arrangements.",
  "Amy 參與了處理方式的選擇。資料得到整理，支援可以按她的實際需要逐步安排。": "Amy takes part in choosing how to respond. The information is organised and support can be arranged gradually according to her actual needs.",
  "共同整理資料並商討支援": "Organise information and discuss support together",
  "未經 Amy 同意，立即聯絡所有涉事同學的家長，並把她的遭遇和截圖轉發給他們。": "Without Amy's consent, immediately contact the parents of all students involved and forward her experience and screenshots to them.",
  "目的可能是想盡快處理，但未先商討便轉發資料，會讓 Amy 感到私隱和控制感被忽略。": "The intention may be to resolve the matter quickly, but forwarding information before discussing it may make Amy feel that her privacy and control have been disregarded.",
  "建議 Amy 先忍耐一段時間，因為網絡上的事情通常很快會被忘記。": "Suggest that Amy wait for a while, because things online are usually forgotten quickly.",
  "等待未必能令內容停止流傳。Amy 可能感到自己的困難未被重視，壓力和缺課風險也會增加。": "Waiting may not stop the content from circulating. Amy may feel that her difficulties are not being taken seriously, and her stress and risk of missing school may increase.",
  "要求 Amy 立即與涉事同學當面對質，認為這樣才能一次過解決。": "Require Amy to confront the students involved face to face immediately, believing this is the only way to resolve everything at once.",
  "未先評估 Amy 的意願和安全，可能令她感到被逼迫，也令衝突升溫。": "Without first assessing Amy's wishes and safety, this may make her feel pressured and cause the conflict to escalate.",
  "合作處理：支持網開始形成": "Working together: a support network begins to form",
  "你和 Amy 一起保存資料、確認仍在流傳的內容，並商討她希望誰知道、誰可以協助。": "You and Amy save information together, identify content that is still circulating and discuss whom she wants to know and who can help.",
  "Amy 選擇先由一位信任的老師和家人陪伴她。你們也討論了合適的舉報及封鎖方法，並約好下次再檢視她在學校的感受。": "Amy chooses to be accompanied first by a teacher she trusts and her family. You also discuss appropriate ways to report and block the content, and agree to review how she feels at school next time.",
  "這不代表事情立即消失，但 Amy 不再需要獨自承受。接下來，旁觀者的選擇也可能影響事件走向。": "This does not mean the problem disappears immediately, but Amy no longer has to face it alone. The choices of bystanders may also affect what happens next.",
  "準備看看另一個重要位置：看見事件的同學可以怎樣做。": "Now consider another important perspective: what can classmates who witness the incident do?",
  "在 Amy 同意及清楚知道安排的前提下，繼續以最少披露方式提供支持，並把注意力轉到如何減少傳播。": "With Amy's agreement and a clear explanation of the arrangements, continue supporting her through minimal disclosure and focus on reducing further spread.",
  "共同決定和最少披露，有助保留 Amy 的掌控感。支持網正慢慢形成。": "Shared decisions and minimal disclosure help preserve Amy's sense of control. A support network is gradually taking shape.",
  "尊重意願，以最少披露方式跟進": "Respect her wishes and follow up with minimal disclosure",
  "私隱被忽略後": "After privacy was overlooked",
  "Amy 知道你已把截圖和她的遭遇傳給多位家長後，顯得非常不安。": "Amy becomes very uneasy when she learns that you have sent screenshots and details of her experience to several parents.",
  "她問：「點解你未問過我，就 send 咗畀咁多人？」她擔心更多人談論自己，也覺得失去了控制。": "She asks, “Why did you send it to so many people without asking me?” She worries that more people will talk about her and feels that she has lost control.",
  "你可以怎樣修正這個跟進方式？": "How could you repair this follow-up approach?",
  "承認自己忽略了 Amy 的意願，停止非必要轉發；和她重新商討誰需要知道、怎樣以最少披露方式跟進。": "Acknowledge that you overlooked Amy's wishes, stop unnecessary forwarding, and discuss again with her who needs to know and how to follow up with minimal disclosure.",
  "修正並不會抹去已發生的事，但停止額外披露、清楚說明和重新商討，能慢慢修復信任。": "Repair does not erase what has happened. However, stopping further disclosure, explaining clearly and discussing the matter again can gradually rebuild trust.",
  "停止非必要披露並重新商討": "Stop unnecessary disclosure and discuss again",
  "說：「我都係為你好，你唔需要知道咁多。」並繼續把資料傳給更多人。": "Say, “I did it for your own good. You don't need to know so much,” and continue sending the information to more people.",
  "當事人的私隱和意願持續被忽略，Amy 可能更不願意求助，也承受額外的二次傷害。": "Amy's privacy and wishes continue to be ignored. She may become less willing to seek help and experience further secondary harm.",
  "等待並沒有令事件停止": "Waiting did not stop the incident",
  "數天後，事件仍然在小群組內流傳。Amy 開始更不願意上學，也沒有再主動找人談。": "Several days later, the incident is still circulating in small group chats. Amy is becoming more reluctant to attend school and has stopped approaching people to talk.",
  "等待未必是中性的選擇。當傷害內容持續流傳而沒有支持，當事人的壓力可能越來越大。": "Waiting is not necessarily a neutral choice. When harmful content continues to circulate without support, the person's stress may increase.",
  "你會怎樣重新介入？": "How would you re-engage?",
  "主動關心 Amy，承認自己低估了事件；重新評估她的安全和情緒、整理資料，並與她商討即時支持。": "Check in with Amy, acknowledge that you underestimated the incident, reassess her safety and emotions, organise information and discuss immediate support with her.",
  "及時修正讓 Amy 知道她的感受被重視。支援雖然來得較遲，仍可逐步建立。": "Timely repair lets Amy know that her feelings matter. Although support has come later, it can still be built gradually.",
  "重新評估安全並提供即時支持": "Reassess safety and provide immediate support",
  "繼續等，認為只要沒有人再提起，就不需要採取任何行動。": "Continue waiting, believing that no action is needed as long as nobody mentions it again.",
  "缺乏跟進會令 Amy 感到孤單，內容也可能在看不見的地方繼續流傳。": "Without follow-up, Amy may feel alone and the content may continue circulating out of sight.",
  "被要求當面對質": "Being asked to confront the other student",
  "聽到要立即和涉事同學對質，Amy 顯得更害怕，雙手緊握著書包帶。": "When Amy hears that she must confront the other student immediately, she becomes more frightened and grips the straps of her schoolbag tightly.",
  "對話或修復安排需要考慮當事人的意願、準備和安全。未準備好的對質，可能令她再次感到無力。": "Any dialogue or restorative arrangement needs to consider the person's wishes, readiness and safety. A confrontation before she is ready may make her feel powerless again.",
  "你會如何調整？": "How would you adjust your approach?",
  "尊重 Amy 的意願，暫停對質；改為先商討安全、支持和其他不需要她直接面對涉事者的方法。": "Respect Amy's wishes and pause the confrontation. Discuss safety and support first, along with other approaches that do not require her to face the student directly.",
  "讓 Amy 重拾一些選擇權。不同情況可以有不同安排，重點是先照顧安全和感受。": "This allows Amy to regain some choice. Different situations may require different arrangements; the priority is her safety and feelings.",
  "尊重意願，暫停直接對質": "Respect her wishes and pause direct confrontation",
  "要求 Amy 要勇敢面對，堅持立刻安排對質。": "Tell Amy to be brave and insist on arranging the confrontation immediately.",
  "當她未準備好就被要求面對，可能令她更害怕，也削弱她對支援者的信任。": "If she is asked to face the other student before she is ready, she may become more frightened and lose trust in the supporter.",
  "視角三 · 旁觀者": "Perspective 3 · The bystander",
  "你現在是一名旁觀者": "You are now a bystander",
  "你不是事件的直接當事人，但你的選擇仍然可以改變它接下來怎樣發展。": "You are not directly involved in the incident, but your choices can still change what happens next.",
  "不轉發、停止起哄、私下關心及向可信任成人求助，都是有分量的行動。旁觀不等於無能為力。": "Not forwarding content, stopping others from egging it on, checking in privately and seeking help from a trusted adult are meaningful actions. Being a bystander does not mean being powerless.",
  "從旁觀者角度出發：想想怎樣減少傷害內容的流傳，並讓受影響的人知道她不是孤身一人。": "From a bystander's perspective, consider how to reduce the spread of harmful content and let the person affected know they are not alone.",
  "以旁觀者身分繼續": "Continue as a bystander",
  "群組裡的一張 Meme 圖": "A Meme in the group chat",
  "放學後，你在另一個班級群組看到 Amy 的黑圖和緋聞被改成 Meme 圖。有人正在起哄，還有人問「有冇人再 send？」": "After school, you see Amy's embarrassing photo and rumours turned into a Meme in another class group chat. Some students are egging it on, and someone asks, “Can anyone send it again?”",
  "你知道轉發只會令 Amy 受到更多傷害，但也擔心自己說話會被朋友取笑。": "You know forwarding it will cause Amy more harm, but you are also worried your friends may make fun of you if you speak up.",
  "即使不是直接參與的人，也可以選擇讓傷害停下來，或令它繼續擴散。": "Even if you are not directly involved, you can choose to help stop the harm or allow it to spread further.",
  "作為旁觀者，你會怎樣做？": "As a bystander, what would you do?",
  "不轉發或起哄；私下關心 Amy，保存必要資料並向可信任的老師或成年人反映。": "Do not forward or encourage it. Check in with Amy privately, save necessary information and report it to a trusted teacher or adult.",
  "你沒有幫助傷害內容擴散，也為 Amy 提供了支持和額外的求助連結。": "You have not helped spread the harmful content, and you have offered Amy support and another link to help.",
  "旁觀者選擇支持而不轉發": "A bystander chooses support without forwarding",
  "假裝沒看見，甚麼都不做，因為不想被捲入事件。": "Pretend not to notice and do nothing because you do not want to get involved.",
  "沉默未必代表認同，但有害內容可能繼續流傳；Amy 也可能不知道有人願意站在她身邊。": "Silence does not necessarily mean agreement, but harmful content may continue circulating. Amy may also not know that someone is willing to stand by her.",
  "為了提醒更多朋友，將 Meme 圖再轉發到其他群組，叫大家不要相信。": "Forward the Meme to other groups to warn more friends and tell them not to believe it.",
  "出發點可能是澄清，但再次轉發仍會讓更多人看見傷害內容，造成二次傳播。": "The intention may be to clarify things, but forwarding it again still exposes more people to the harmful content and causes further circulation.",
  "在群組公開辱罵欺凌者，和他們展開罵戰。": "Publicly insult the person bullying Amy in the group chat and start an argument with them.",
  "公開罵戰可能令更多人加入、截圖和圍觀，令事件由傷害轉成更大的網絡衝突。": "A public argument may attract more people, screenshots and spectators, turning the incident into a larger online conflict.",
  "回顧結局": "Reflection ending",
  "求助的門被關上了": "The door to seeking help has closed",
  "一句話，也可能影響下一次求助": "One sentence can affect whether someone seeks help next time",
  "Amy 離開了辦公室。她未必會再主動找成年人談，也仍要獨自面對網上的內容和上學焦慮。": "Amy leaves the office. She may not approach an adult again, and still has to face the online content and anxiety about going to school alone.",
  "這不是 Amy 的責任。支援者若未能先聆聽、理解和評估安全，可能讓她感到再次被拒絕。重新探索時，可以嘗試承認失誤、真誠道歉，並把選擇權交回給她。": "This is not Amy's fault. If a supporter does not first listen, understand and assess safety, she may feel rejected again. When exploring the story again, try acknowledging the mistake, apologising sincerely and returning choice to her.",
  "反思：當一個人說「我不想再講」，我可以怎樣回應，讓她知道自己仍然值得被好好聽見？": "Reflection: When someone says, “I don't want to talk any more,” how can I respond so they know they still deserve to be heard?",
  "私隱與信任受損": "Privacy and trust have been damaged",
  "善意也需要尊重界線": "Good intentions still need to respect boundaries",
  "更多人知道了 Amy 的遭遇，但她沒有參與這個決定。她感到被再次曝光，也更難相信支援者。": "More people now know what happened to Amy, but she was not involved in that decision. She feels exposed again and finds it harder to trust the supporter.",
  "真實情況中，安全需要和既定程序有時會要求支援者採取行動；重要的是清楚解釋、盡量採取最少披露，並讓當事人參與可以參與的決定。": "In real situations, safety needs and established procedures may sometimes require a supporter to take action. It is important to explain clearly, disclose as little as possible and involve the person in decisions where they can participate.",
  "反思：我可以怎樣在提供支援時，同時保護一個人的私隱、掌控感和安全？": "Reflection: How can I provide support while also protecting a person's privacy, sense of control and safety?",
  "延遲令壓力持續": "Delay allows stress to continue",
  "等待不是唯一選擇": "Waiting is not the only option",
  "事件在小群組裡繼續流傳，Amy 越來越不願意上學，也越來越覺得沒有人會明白。": "The incident continues circulating in small group chats. Amy becomes increasingly reluctant to attend school and feels that nobody understands.",
  "不代表每件事都要公開處理；但主動了解安全、保存必要資料、連結支持和一起商討下一步，能讓受影響的人不必獨自承受。": "This does not mean every matter should be handled publicly. Proactively understanding safety, saving necessary information, connecting support and discussing the next step can help the person avoid facing it alone.",
  "反思：當我不確定怎樣做時，誰可以和我一起評估情況，而不是只希望問題自行消失？": "Reflection: When I am unsure what to do, who can help me assess the situation rather than simply hoping the problem disappears?",
  "被迫面對，並非被支持": "Being forced to face someone is not the same as being supported",
  "安全和準備比「勇敢」更重要": "Safety and readiness matter more than being “brave”",
  "Amy 被要求立刻面對涉事者，感到更害怕，也失去對處理方式的信任。": "Amy is required to face the other student immediately. She becomes more frightened and loses trust in the way the situation is being handled.",
  "有些情況也許需要對話或修復安排，但這應建立在充足準備、清楚界線、當事人意願和安全評估之上。": "Some situations may call for dialogue or restorative arrangements, but these should be based on adequate preparation, clear boundaries, the person's wishes and a safety assessment.",
  "反思：我有沒有先了解當事人現在是否準備好？還有沒有較安全、較少壓力的支持方法？": "Reflection: Have I first found out whether the person is ready? Are there safer ways to offer support with less pressure?",
  "故事結局": "Story ending",
  "支持網正在形成": "A support network is taking shape",
  "不轉發，也是一種有力的選擇": "Not forwarding is a powerful choice too",
  "你沒有讓傷害內容再擴散，並以關心和求助為 Amy 多連上一條支持線。": "You have not allowed the harmful content to spread further. Through care and help-seeking, you have added another line of support for Amy.",
  "網絡欺凌不會因一個人而立刻結束；但當受影響的人得到聆聽、支援和安全的選擇，當旁觀者拒絕傳播內容，改變便可以從群組裡的一個人開始。": "Cyberbullying will not stop immediately because of one person. But when the person affected is heard and receives support and safe choices, and bystanders refuse to spread the content, change can begin with one person in the group.",
  "帶走的提醒：不要轉發傷害內容；保存必要資料；向可信任的人求助；用尊重的方式陪伴受影響的人。": "Takeaway: Do not forward harmful content; save necessary information; seek help from someone you trust; accompany the person affected with respect.",
  "沉默也有後果": "Silence also has consequences",
  "你仍然可以選擇支持": "You can still choose to offer support",
  "你沒有直接參與轉發，但群組裡的傷害內容沒有因此停下來。Amy 也未必知道有人看見她正在承受的事。": "You did not forward the content yourself, but the harmful material in the group chat did not stop. Amy may not even know that someone has seen what she is going through.",
  "不必獨自和整個群組對抗。私下關心、不轉發、向可信任的老師或成年人反映，都是既安全又有分量的旁觀者行動。": "You do not have to confront the whole group alone. Checking in privately, not forwarding and reporting to a trusted teacher or adult are safe and meaningful actions for a bystander.",
  "帶走的提醒：旁觀者不需要做英雄式對抗；可以先做一個不讓傷害擴散、願意連結支持的人。": "Takeaway: Bystanders do not need to make a heroic confrontation. Start by refusing to spread harm and being willing to connect someone with support.",
  "內容再一次被擴散": "The content has spread again",
  "澄清，不必靠再轉發": "Clarifying does not require forwarding again",
  "你原本想提醒朋友，但 Meme 圖和謠言又被更多人看見。": "You wanted to warn your friends, but more people have now seen the Meme and rumours.",
  "面對有害內容時，可以不附上原圖或原文；保留必要資料給能協助的人，私下關心受影響者，並使用平台舉報和學校支援途徑。": "When you encounter harmful content, you can avoid attaching the original image or text. Keep necessary information for people who can help, check in privately with the person affected, and use platform reporting and school support channels.",
  "帶走的提醒：想支持一個人，不代表要再次讓傷害內容曝光。": "Takeaway: Wanting to support someone does not mean exposing the harmful content again.",
  "衝突升溫了": "The conflict has escalated",
  "反擊不一定能讓傷害停止": "Retaliation does not necessarily stop the harm",
  "群組變成罵戰；更多同學圍觀、截圖，原本的傷害內容再次成為焦點。": "The group chat has turned into an argument. More students are watching and taking screenshots, and the original harmful content has become the focus again.",
  "看見不公平時感到憤怒很自然。但以辱罵回應，常會令內容更加流傳。較安全的選擇是停止轉發、保留必要資料、支持受影響者並尋求成人協助。": "It is natural to feel angry when you see injustice. But responding with insults often makes the content spread further. Safer choices include stopping forwarding, keeping necessary information, supporting the person affected and seeking adult help.",
  "帶走的提醒：把焦點從罵贏對方，轉向怎樣讓受影響的人更安全、更有支持。": "Takeaway: Shift the focus from winning an argument to making the person affected safer and better supported.",
  "故事首頁": "Story home",
  "視角轉換": "Change of perspective",
  "故事頁面": "Story page",
  "Amy 的經歷": "Amy's experience",
  "社工的回應": "The social worker's response",
  "共同跟進": "Working together",
  "旁觀者的選擇": "Bystander choices",
  "故事旅程": "Story journey",
  "回到故事首頁": "Back to story home",
  "Media Heroes 學習提示": "Media Heroes learning point",
  "Media Heroes 學習提示｜": "Media Heroes learning point | ",
  "可選行動": "Available actions",
  "守護行動紀錄": "Supportive actions along the journey",
  "這個選擇正在建立支持": "This choice is building support",
  "這個選擇可能令傷害擴散": "This choice may spread the harm further",
  "這個選擇值得再想一想": "This choice is worth thinking about again",
  "你已在故事首頁。按「開始故事」可重新進入旅程。": "You are already on the story home page. Select “Start story” to begin the journey again.",
  "你已在故事首頁。按「開始故事」可進入旅程。": "You are already on the story home page. Select “Start story” to enter the journey."
};
Object.assign(translations, {
  "Media Heroes\n數碼世界守護者": "Media Heroes\nGuardians of the Digital World",
  "開始故事": "Start story",
  "新的任務": "New mission",
  "你的任務": "Your mission",
  "重新探索故事": "Explore the story again",
  "回到上一頁": "Back",
  "如故事內容令你感到不舒服，請暫停，並向你信任的成年人、老師、學校社工或合適的支援服務求助。": "If this story makes you feel uncomfortable, pause and seek help from an adult you trust, a teacher, a school social worker or an appropriate support service.",
  "Media Heroes · 數碼世界守護者": "Media Heroes · Guardians of the Digital World",
  "Media Heroes · 學習提示": "Media Heroes · Learning point",
  "Media Heroes 是用於網絡欺凌預防、同理及安全討論的學習情境；本互動故事不構成直接個案管理指引。": "Media Heroes is a learning scenario for cyberbullying prevention, empathy and online-safety discussion. This interactive story is not a direct case-management protocol.",
  "先保護自己，再尋找支持": "Protect yourself first, then seek support",
  "Responding to a disclosure": "Responding to a disclosure",
  "犯錯後，仍可重新聆聽": "Listening again after a mistake",
  "一起作決定": "Making decisions together",
  "修正介入方式": "Adjusting the response",
  "旁觀者也能減少傷害": "Bystanders can also reduce harm",
  "跳到故事內容": "Skip to story content"
});

function translate(value = "") {
  return language === "en" ? (translations[String(value)] ?? String(value)) : String(value);
}

const roleMap = {
  amy: { label: "Amy 視角", icon: icons.amy },
  social: { label: "學校社工視角", icon: icons.social },
  bystander: { label: "旁觀者視角", icon: icons.bystander },
};

const journeyIndex = {
  home: 0,
  "opening-amy": 0,
  s1: 0,
  s2: 0,
  "opening-social-v1": 1,
  "opening-social-v2": 1,
  s3_v1: 1,
  s3_v2: 1,
  s3_retry: 1,
  s4: 2,
  s5a: 2,
  s5b: 2,
  s5c: 2,
  s5d: 2,
  "opening-bystander": 3,
  s6: 3,
};

const sceneVisuals = {
  home: {
    src: "assets/s1-class-chat.png",
    alt: "校園像素畫：Amy 在課室裡看見手機班群中的未經同意照片，感到不安。",
  },
  s1: {
    src: "assets/s1-class-chat.png",
    alt: "校園像素畫：手機班群顯示一張 Amy 的尷尬照片和抽象訊息泡泡，Amy 在課室裡擔心地看著手機。",
  },
  s2: {
    src: "assets/s2-rumour-story.png",
    alt: "校園像素畫：Amy 在走廊中看著手機上的抽象限時動態式謠言畫面，遠處有同學在交談。",
  },
  s3v1: {
    src: "assets/s3-v1-disclosure.png",
    alt: "校園像素畫：Amy 在社工室向學校社工展示手機上的班群內容，社工安靜聆聽。",
  },
  s3v2: {
    src: "assets/s3-v2-disclosure.png",
    alt: "校園像素畫：Amy 在社工室說明手機上的兩類網絡內容，社工平靜地聆聽。",
  },
  repair: {
    src: "assets/s3-repair.png",
    alt: "校園像素畫：社工放下筆、以開放姿勢再次聆聽 Amy，兩人在安靜的社工室交談。",
  },
  plan: {
    src: "assets/s4-support-plan.png",
    alt: "校園像素畫：Amy 與學校社工一起查看有盾牌、對話和私隱圖示的支援計劃。",
  },
  privacy: {
    src: "assets/s5b-privacy.png",
    alt: "校園像素畫：Amy 看見螢幕上多個抽象轉發和通知圖示，社工注意到她的不安。",
  },
  delay: {
    src: "assets/s5c-delay.png",
    alt: "校園像素畫：放學後的空走廊裡，Amy 獨自看著不斷亮起通知的手機。",
  },
  confrontation: {
    src: "assets/s5d-confrontation.png",
    alt: "校園像素畫：社工以手勢暫停走廊中的面對面談話，Amy 顯得緊張但受到保護。",
  },
  bystander: {
    src: "assets/s6-bystander.png",
    alt: "校園像素畫：一名旁觀同學在手機前停下轉發動作，遠處有可求助的老師。",
  },
};

const lessons = {
  amyFirstSteps: {
    title: "Media Heroes 學習提示｜先保護自己，再尋找支持",
    items: [
      "保存有需要的資料，毋須把傷害內容再傳給更多人。",
      "不以報復或再轉發回應，減少二次傳播。",
      "可封鎖、舉報有害帳戶或內容，並向可信任的成年人求助。",
    ],
    note: "當網絡內容令人受傷時，得到支持不代表要獨自證明一切；可以一步一步處理。",
  },
  disclosure: {
    title: "Media Heroes 學習提示｜Responding to a disclosure",
    items: [
      "Stay calm：保持冷靜，避免倉促行動。",
      "Listen with empathy：以同理心聆聽 Amy 所經歷的事件和感受。",
      "Treat with respect and be supportive：以尊重的態度支持她，不責備、不淡化她的經歷。",
      "Check safety concerns：了解她是否有安全上的憂慮，以及事件是否仍在持續。",
    ],
    note: "被傾聽與被尊重，往往是披露後最重要的第一步。這些是支援者可參考的回應原則；實際跟進仍應按情況、學校程序及專業判斷處理。",
  },
  repair: {
    title: "Media Heroes 學習提示｜犯錯後，仍可重新聆聽",
    items: [
      "承認自己剛才的回應沒有接住對方，而不是為自己辯解。",
      "真誠道歉，重新把焦點放回 Amy 的感受與安全。",
      "讓 Amy 知道她可按自己的步伐說下去，也可一起商量下一步。",
    ],
    note: "修正不會抹去已造成的感受，但能讓對話重新有安全的空間。",
  },
  sharedPlan: {
    title: "Media Heroes 學習提示｜一起作決定",
    items: [
      "先了解事件是否仍在持續，以及 Amy 此刻的安全需要。",
      "整理所需資料、商討舉報和封鎖，避免額外轉發傷害內容。",
      "在可行範圍內讓 Amy 參與決定，尊重她的私隱和意願。",
    ],
    note: "好的支持不是代替當事人作所有決定，而是讓她在安全的情況下重新擁有選擇。",
  },
  repairChoice: {
    title: "Media Heroes 學習提示｜修正介入方式",
    items: [
      "暫停會增加壓力或曝光的做法，先說明和道歉。",
      "重新評估安全、私隱和 Amy 的準備程度。",
      "以最少披露和共同商討的方式，逐步連結合適支持。",
    ],
    note: "不同情況未必有單一處理方法；重要的是不把當事人的意願和安全放到最後。",
  },
  bystander: {
    title: "Media Heroes 學習提示｜旁觀者也能減少傷害",
    items: [
      "不轉發、不起哄，也不把有害內容當作談資。",
      "私下關心受影響的人，讓她知道不是孤身一人。",
      "把需要的資料交給能提供協助的可信任成年人，而非再傳到其他群組。",
    ],
    note: "旁觀者不需要獨自與所有人對抗；選擇不傳播並連結支持，已能改變群組文化。",
  },
};

const scenes = {
  home: {
    type: "home",
    visual: sceneVisuals.home,
    stage: "課堂互動故事",
    title: "Media Heroes\n數碼世界守護者",
    lead: "從不同角色的眼睛，練習看見網絡欺凌帶來的影響，以及能夠建立支持網的每一個選擇。",
    body: [
      "這是一個以香港校園情境設計的互動故事。你將先後成為 Amy、學校社工及旁觀者，親身經過同一件事的不同位置。",
      "故事中的選擇會呈現可能帶來的後果；它不是評分測驗，也不取代學校的既定程序或專業判斷。",
    ],
  },
  "opening-amy": {
    type: "interstitial",
    role: "amy",
    visual: sceneVisuals.s1,
    stage: "視角一 · 受事件影響的人",
    title: "你現在是 Amy",
    lead: "你剛發現，一張未經你同意的照片正在班級群組流傳。此刻最重要的，不是獨自承受。",
    body: "接下來的選擇會影響內容是否繼續擴散、你是否得到支持，以及你對事情的掌控感。",
    mission: "從 Amy 的位置出發：先照顧自己、避免讓傷害內容再擴散，並想想可以向誰求助。",
    next: "s1",
    nextLabel: "以 Amy 身分開始",
  },
  s1: {
    type: "scene",
    idLabel: "S1",
    role: "amy",
    visual: sceneVisuals.s1,
    title: "WhatsApp 群組的黑圖",
    lead: "某天，你發現班上的 WhatsApp group 突然變得非常熱鬧。",
    body: [
      "原來，有同學未經 Amy 同意，將她的「黑圖」上傳到群組，並加上侮辱性的文字。其他同學開始取笑 Amy，有人甚至把照片轉發到其他群組。",
      "Amy 發現後感到非常難過，也開始害怕回到學校。",
    ],
    quote: "群組訊息不斷彈出：有人取笑照片，也有人說「再 send 畀其他人睇」。",
    mission: "如果你是 Amy，此刻會怎樣做？",
    choices: [
      {
        key: "1A",
        label: "我立即在群組反擊，辱罵那些取笑我的同學，讓他們也感受被羞辱的滋味。",
        next: "s2",
        tone: "risk",
        outcome: "公開反擊或會令更多人加入爭論。內容被不斷截圖、轉發，事件可能更快擴散。",
      },
      {
        key: "1B",
        label: "我甚麼都不做，立即退出群組，假裝這件事沒有發生。",
        next: "s2",
        tone: "reflect",
        outcome: "暫時離開群組可讓 Amy 喘一口氣，但照片仍可能流傳；她也仍然要獨自面對壓力。",
      },
      {
        key: "1C",
        label: "我先保存群組對話及照片作為證據，封鎖及舉報相關帳戶，並向信任的老師或家人求助。",
        next: "opening-social-v1",
        tone: "support",
        outcome: "Amy 沒有再轉發傷害內容，並保存了資料、尋求可信任成人協助。她不必一個人處理。",
        action: "保存資料並及早求助",
        lesson: "amyFirstSteps",
      },
      {
        key: "1D",
        label: "我把照片轉發到其他群組，讓更多人知道有人欺負我，希望大家幫我討回公道。",
        next: "s2",
        tone: "risk",
        outcome: "即使 Amy 想獲得支持，轉發同一張照片也會令更多人看見它，形成二次傳播。",
      },
    ],
  },
  s2: {
    type: "scene",
    idLabel: "S2",
    role: "amy",
    visual: sceneVisuals.s2,
    title: "Instagram 上的緋聞謠言",
    lead: "因為事情沒有得到合適處理，情況開始變得更加嚴重。",
    body: [
      "第二天，Amy 回到學校，發現更多同學看過她的黑圖，甚至有人在走廊上偷偷議論她。",
      "她打開 Instagram，發現有同學在限時動態發布關於她的謠言；有人正在回覆、轉發，還在留言中取笑她。Amy 感到尷尬、憤怒和難過，擔心更多人會相信不實消息。",
    ],
    quote: "「聽講 Amy 同班上某個男同學有一腿喎！佢哋係咪已經秘密拍拖？😂」",
    mission: "如果你是 Amy，你會怎樣做？",
    choices: [
      {
        key: "2A",
        label: "立即在 Instagram 限時動態公開反擊，直接點名辱罵散播謠言的同學。",
        next: "opening-social-v2",
        tone: "risk",
        outcome: "互相指責可能令更多同學圍觀和截圖。事件得到更多注意，Amy 的壓力也可能上升。",
      },
      {
        key: "2B",
        label: "先保存限時動態及相關留言作為證據，不轉發謠言；舉報、封鎖相關帳戶，並向可信任的老師或學校社工求助。",
        next: "opening-social-v2",
        tone: "support",
        outcome: "Amy 保存了較完整的資料，沒有再擴散謠言，也主動連結到支持。",
        action: "不轉發謠言，保存資料並求助",
        lesson: "amyFirstSteps",
      },
      {
        key: "2C",
        label: "甚麼都不做，假裝沒有看見，亦不向任何人透露事件，希望過幾日大家便會忘記。",
        next: "opening-social-v2",
        tone: "reflect",
        outcome: "Amy 避開了當下的衝突，但謠言仍可能持續流傳；獨自承受會令壓力越積越多。",
      },
    ],
  },
  "opening-social-v1": {
    type: "interstitial",
    role: "social",
    visual: sceneVisuals.s3v1,
    stage: "視角二 · 支援者",
    title: "你現在是學校社工",
    lead: "Amy 在事情剛開始時便主動求助。你掌握到的是 WhatsApp 群組黑圖事件。",
    body: "你的任務不是立刻判斷、責備，或代替 Amy 決定。先讓她感到被聆聽、被理解，再了解她目前的安全需要。",
    mission: "由支援者角度出發：冷靜聆聽、尊重感受及私隱，並一起想下一步。",
    next: "s3_v1",
    nextLabel: "以學校社工身分繼續",
  },
  "opening-social-v2": {
    type: "interstitial",
    role: "social",
    visual: sceneVisuals.s3v2,
    stage: "視角二 · 支援者",
    title: "你現在是學校社工",
    lead: "Amy 前來求助時，黑圖和謠言都已出現。她很害怕事件會繼續傳開。",
    body: "你的任務不是立刻判斷、責備，或代替 Amy 決定。先讓她感到被聆聽、被理解，再了解她目前的安全需要。",
    mission: "由支援者角度出發：冷靜聆聽、尊重感受及私隱，並一起想下一步。",
    next: "s3_v2",
    nextLabel: "以學校社工身分繼續",
  },
  s3_v1: {
    type: "scene",
    idLabel: "S3_v1",
    role: "social",
    visual: sceneVisuals.s3v1,
    title: "接收 Amy 的求助",
    lead: "某天下午，Amy 主動來到你的辦公室，說最近在網絡上受到欺凌。",
    body: [
      "她向你展示 WhatsApp 群組中被公開的黑圖。",
      "Amy 看起來十分緊張，說完後低下頭，似乎不太願意繼續說下去。",
    ],
    quote: "「姑娘，我真係唔知點算……我啲黑圖而家 send 到滿天飛。我而家好驚返學，成日都覺得有人笑緊我。」",
    mission: "作為學校社工，你會怎樣回應 Amy？",
    choices: [
      {
        key: "3A",
        label: "責備 Amy，問佢有冇諗過點解其他人唔蝦、淨係蝦你一個，有冇喺自己身上面搵原因。",
        next: "s3_retry",
        tone: "risk",
        outcome: "把責任放回 Amy 身上，會令她感到被責怪和更不願意說下去。這段關係仍有機會修復。",
      },
      {
        key: "3B",
        label: "告訴 Amy：「船到橋頭自然直，呢啲小事你唔使咁緊張，過幾日就會冇事。」",
        next: "s3_retry",
        tone: "reflect",
        outcome: "淡化她的經歷可能令 Amy 覺得不被相信，也錯失了解她安全和壓力的機會。這段關係仍有機會修復。",
      },
      {
        key: "3C",
        label: "保持冷靜，耐心聆聽 Amy 的經歷及感受，表達理解和支持，並進一步了解她目前的安全情況及事件是否仍在持續。",
        next: "s4",
        tone: "support",
        outcome: "Amy 感到被接住。先聆聽和了解安全需要，能讓她更有空間參與下一步的決定。被傾聽與被尊重，往往是披露後最重要的第一步。",
        action: "耐心聆聽並了解安全需要",
        lesson: "disclosure",
      },
    ],
  },
  s3_v2: {
    type: "scene",
    idLabel: "S3_v2",
    role: "social",
    visual: sceneVisuals.s3v2,
    title: "接收 Amy 的求助",
    lead: "某天下午，Amy 主動來到你的辦公室，向你表示最近在網絡上受到欺凌。",
    body: [
      "她向你展示 WhatsApp 群組中的黑圖，以及 Instagram 上散播她與男同學緋聞的限時動態。",
      "Amy 看起來十分緊張。她怕更多人看見，也不知道還會不會有人繼續傳出去。",
    ],
    quote: "「老師，我真係唔知點算……好多人都睇過啲相同謠言，返到學校又有人笑我。我而家好驚返學。」",
    mission: "作為學校社工，你會怎樣回應 Amy？",
    choices: [
      {
        key: "3A",
        label: "責備 Amy，問佢有冇諗過點解其他人唔蝦、淨係蝦你一個，有冇喺自己身上面搵原因。",
        next: "s3_retry",
        tone: "risk",
        outcome: "把責任放回 Amy 身上，會令她感到被責怪和更不願意說下去。這段關係仍有機會修復。",
      },
      {
        key: "3B",
        label: "告訴 Amy：「船到橋頭自然直，呢啲小事你唔使咁緊張，過幾日就會冇事。」",
        next: "s3_retry",
        tone: "reflect",
        outcome: "淡化她的經歷可能令 Amy 覺得不被相信，也錯失了解她安全和壓力的機會。這段關係仍有機會修復。",
      },
      {
        key: "3C",
        label: "保持冷靜，耐心聆聽 Amy 的經歷及感受，表達理解和支持，並進一步了解她目前的安全情況及事件是否仍在持續。",
        next: "s4",
        tone: "support",
        outcome: "Amy 感到被接住。先聆聽和了解安全需要，能讓她更有空間參與下一步的決定。被傾聽與被尊重，往往是披露後最重要的第一步。",
        action: "耐心聆聽並了解安全需要",
        lesson: "disclosure",
      },
    ],
  },
  s3_retry: {
    type: "scene",
    idLabel: "S3_retry",
    role: "social",
    visual: sceneVisuals.repair,
    title: "重新建立對話的空間",
    lead: "Amy 聽完後沉默了一會兒，聲音更小了。",
    body: ["她的反應提醒你：剛才的說話沒有好好接住她。支援者也會犯錯，重要的是能否承認、修正和重新聆聽。"],
    quote: "「算啦，可能真係我自己有問題……我唔想再講喇。」",
    mission: "你會如何回應，讓 Amy 有機會重新感到安全？",
    choices: [
      {
        key: "3D",
        label: "承認自己剛才太快判斷，向 Amy 道歉；重新聆聽，告訴她不需要一個人承受，並先了解她現在是否安全。",
        next: "s4",
        tone: "support",
        outcome: "真誠承認和修正，不能抹去剛才的感受，卻可以讓 Amy 慢慢重拾一些安全感和選擇權。",
        action: "承認失誤並重新聆聽",
        lesson: "repair",
      },
      {
        key: "3E",
        label: "說：「如果你唔想講，我都幫唔到你。」然後結束談話。",
        next: "s3_retry_end",
        tone: "risk",
        outcome: "這會把求助的責任再次放在 Amy 身上。她離開時更孤單，也可能不再願意向成年人求助。",
      },
    ],
  },
  s4: {
    type: "scene",
    idLabel: "S4",
    role: "social",
    visual: sceneVisuals.plan,
    title: "一起商討下一步",
    lead: "因為你保持冷靜、耐心聆聽並尊重 Amy 的感受，你和 Amy 已初步建立信任；她願意繼續披露自己的情況。你知道事件仍有被轉發的情況，而 Amy 最近不太願意上學。",
    body: [
      "Amy 希望內容停止流傳，但也擔心事件被更多人知道。現在需要在安全、證據、私隱和她的意願之間，和她一起找合適的下一步。",
      "每個選項都會帶來不同的後果；你會怎樣開始？",
    ],
    mission: "作為支援者，你會採取哪一種跟進方式？",
    choices: [
      {
        key: "4A",
        label: "和 Amy 一起整理及保存資料、了解事件是否仍在持續，評估安全需要，再商討舉報、封鎖和校內支援等安排。",
        next: "s5a",
        tone: "support",
        outcome: "Amy 參與了處理方式的選擇。資料得到整理，支援可以按她的實際需要逐步安排。",
        action: "共同整理資料並商討支援",
        lesson: "sharedPlan",
      },
      {
        key: "4B",
        label: "未經 Amy 同意，立即聯絡所有涉事同學的家長，並把她的遭遇和截圖轉發給他們。",
        next: "s5b",
        tone: "risk",
        outcome: "目的可能是想盡快處理，但未先商討便轉發資料，會讓 Amy 感到私隱和控制感被忽略。",
      },
      {
        key: "4C",
        label: "建議 Amy 先忍耐一段時間，因為網絡上的事情通常很快會被忘記。",
        next: "s5c",
        tone: "reflect",
        outcome: "等待未必能令內容停止流傳。Amy 可能感到自己的困難未被重視，壓力和缺課風險也會增加。",
      },
      {
        key: "4D",
        label: "要求 Amy 立即與涉事同學當面對質，認為這樣才能一次過解決。",
        next: "s5d",
        tone: "risk",
        outcome: "未先評估 Amy 的意願和安全，可能令她感到被逼迫，也令衝突升溫。",
      },
    ],
  },
  s5a: {
    type: "scene",
    idLabel: "S5A",
    role: "social",
    visual: sceneVisuals.plan,
    title: "合作處理：支持網開始形成",
    lead: "你和 Amy 一起保存資料、確認仍在流傳的內容，並商討她希望誰知道、誰可以協助。",
    body: [
      "Amy 選擇先由一位信任的老師和家人陪伴她。你們也討論了合適的舉報及封鎖方法，並約好下次再檢視她在學校的感受。",
      "這不代表事情立即消失，但 Amy 不再需要獨自承受。接下來，旁觀者的選擇也可能影響事件走向。",
    ],
    mission: "準備看看另一個重要位置：看見事件的同學可以怎樣做。",
    choices: [
      {
        key: "5A-1",
        label: "在 Amy 同意及清楚知道安排的前提下，繼續以最少披露方式提供支持，並把注意力轉到如何減少傳播。",
        next: "opening-bystander",
        tone: "support",
        outcome: "共同決定和最少披露，有助保留 Amy 的掌控感。支持網正慢慢形成。",
        action: "尊重意願，以最少披露方式跟進",
        lesson: "sharedPlan",
      },
    ],
  },
  s5b: {
    type: "scene",
    idLabel: "S5B",
    role: "social",
    visual: sceneVisuals.privacy,
    title: "私隱被忽略後",
    lead: "Amy 知道你已把截圖和她的遭遇傳給多位家長後，顯得非常不安。",
    body: ["她問：「點解你未問過我，就 send 咗畀咁多人？」她擔心更多人談論自己，也覺得失去了控制。"],
    mission: "你可以怎樣修正這個跟進方式？",
    choices: [
      {
        key: "5B-1",
        label: "承認自己忽略了 Amy 的意願，停止非必要轉發；和她重新商討誰需要知道、怎樣以最少披露方式跟進。",
        next: "opening-bystander",
        tone: "support",
        outcome: "修正並不會抹去已發生的事，但停止額外披露、清楚說明和重新商討，能慢慢修復信任。",
        action: "停止非必要披露並重新商討",
        lesson: "repairChoice",
      },
      {
        key: "5B-2",
        label: "說：「我都係為你好，你唔需要知道咁多。」並繼續把資料傳給更多人。",
        next: "s5b_end",
        tone: "risk",
        outcome: "當事人的私隱和意願持續被忽略，Amy 可能更不願意求助，也承受額外的二次傷害。",
      },
    ],
  },
  s5c: {
    type: "scene",
    idLabel: "S5C",
    role: "social",
    visual: sceneVisuals.delay,
    title: "等待並沒有令事件停止",
    lead: "數天後，事件仍然在小群組內流傳。Amy 開始更不願意上學，也沒有再主動找人談。",
    body: ["等待未必是中性的選擇。當傷害內容持續流傳而沒有支持，當事人的壓力可能越來越大。"],
    mission: "你會怎樣重新介入？",
    choices: [
      {
        key: "5C-1",
        label: "主動關心 Amy，承認自己低估了事件；重新評估她的安全和情緒、整理資料，並與她商討即時支持。",
        next: "opening-bystander",
        tone: "support",
        outcome: "及時修正讓 Amy 知道她的感受被重視。支援雖然來得較遲，仍可逐步建立。",
        action: "重新評估安全並提供即時支持",
        lesson: "repairChoice",
      },
      {
        key: "5C-2",
        label: "繼續等，認為只要沒有人再提起，就不需要採取任何行動。",
        next: "s5c_end",
        tone: "reflect",
        outcome: "缺乏跟進會令 Amy 感到孤單，內容也可能在看不見的地方繼續流傳。",
      },
    ],
  },
  s5d: {
    type: "scene",
    idLabel: "S5D",
    role: "social",
    visual: sceneVisuals.confrontation,
    title: "被要求當面對質",
    lead: "聽到要立即和涉事同學對質，Amy 顯得更害怕，雙手緊握著書包帶。",
    body: ["對話或修復安排需要考慮當事人的意願、準備和安全。未準備好的對質，可能令她再次感到無力。"],
    mission: "你會如何調整？",
    choices: [
      {
        key: "5D-1",
        label: "尊重 Amy 的意願，暫停對質；改為先商討安全、支持和其他不需要她直接面對涉事者的方法。",
        next: "opening-bystander",
        tone: "support",
        outcome: "讓 Amy 重拾一些選擇權。不同情況可以有不同安排，重點是先照顧安全和感受。",
        action: "尊重意願，暫停直接對質",
        lesson: "repairChoice",
      },
      {
        key: "5D-2",
        label: "要求 Amy 要勇敢面對，堅持立刻安排對質。",
        next: "s5d_end",
        tone: "risk",
        outcome: "當她未準備好就被要求面對，可能令她更害怕，也削弱她對支援者的信任。",
      },
    ],
  },
  "opening-bystander": {
    type: "interstitial",
    role: "bystander",
    visual: sceneVisuals.bystander,
    stage: "視角三 · 旁觀者",
    title: "你現在是一名旁觀者",
    lead: "你不是事件的直接當事人，但你的選擇仍然可以改變它接下來怎樣發展。",
    body: "不轉發、停止起哄、私下關心及向可信任成人求助，都是有分量的行動。旁觀不等於無能為力。",
    mission: "從旁觀者角度出發：想想怎樣減少傷害內容的流傳，並讓受影響的人知道她不是孤身一人。",
    next: "s6",
    nextLabel: "以旁觀者身分繼續",
  },
  s6: {
    type: "scene",
    idLabel: "S6",
    role: "bystander",
    visual: sceneVisuals.bystander,
    title: "群組裡的一張 Meme 圖",
    lead: "放學後，你在另一個班級群組看到 Amy 的黑圖和緋聞被改成 Meme 圖。有人正在起哄，還有人問「有冇人再 send？」",
    body: [
      "你知道轉發只會令 Amy 受到更多傷害，但也擔心自己說話會被朋友取笑。",
      "即使不是直接參與的人，也可以選擇讓傷害停下來，或令它繼續擴散。",
    ],
    mission: "作為旁觀者，你會怎樣做？",
    choices: [
      {
        key: "6A",
        label: "不轉發或起哄；私下關心 Amy，保存必要資料並向可信任的老師或成年人反映。",
        next: "end_support_network",
        tone: "support",
        outcome: "你沒有幫助傷害內容擴散，也為 Amy 提供了支持和額外的求助連結。",
        action: "旁觀者選擇支持而不轉發",
        lesson: "bystander",
      },
      {
        key: "6B",
        label: "假裝沒看見，甚麼都不做，因為不想被捲入事件。",
        next: "end_silence",
        tone: "reflect",
        outcome: "沉默未必代表認同，但有害內容可能繼續流傳；Amy 也可能不知道有人願意站在她身邊。",
      },
      {
        key: "6C",
        label: "為了提醒更多朋友，將 Meme 圖再轉發到其他群組，叫大家不要相信。",
        next: "end_forwarding",
        tone: "risk",
        outcome: "出發點可能是澄清，但再次轉發仍會讓更多人看見傷害內容，造成二次傳播。",
      },
      {
        key: "6D",
        label: "在群組公開辱罵欺凌者，和他們展開罵戰。",
        next: "end_escalation",
        tone: "risk",
        outcome: "公開罵戰可能令更多人加入、截圖和圍觀，令事件由傷害轉成更大的網絡衝突。",
      },
    ],
  },
  s3_retry_end: {
    type: "ending",
    idLabel: "回顧結局",
    role: "social",
    visual: sceneVisuals.delay,
    variant: "care",
    banner: "求助的門被關上了",
    title: "一句話，也可能影響下一次求助",
    lead: "Amy 離開了辦公室。她未必會再主動找成年人談，也仍要獨自面對網上的內容和上學焦慮。",
    body: "這不是 Amy 的責任。支援者若未能先聆聽、理解和評估安全，可能讓她感到再次被拒絕。重新探索時，可以嘗試承認失誤、真誠道歉，並把選擇權交回給她。",
    reflection: "反思：當一個人說「我不想再講」，我可以怎樣回應，讓她知道自己仍然值得被好好聽見？",
  },
  s5b_end: {
    type: "ending",
    idLabel: "回顧結局",
    role: "social",
    visual: sceneVisuals.privacy,
    variant: "care",
    banner: "私隱與信任受損",
    title: "善意也需要尊重界線",
    lead: "更多人知道了 Amy 的遭遇，但她沒有參與這個決定。她感到被再次曝光，也更難相信支援者。",
    body: "真實情況中，安全需要和既定程序有時會要求支援者採取行動；重要的是清楚解釋、盡量採取最少披露，並讓當事人參與可以參與的決定。",
    reflection: "反思：我可以怎樣在提供支援時，同時保護一個人的私隱、掌控感和安全？",
  },
  s5c_end: {
    type: "ending",
    idLabel: "回顧結局",
    role: "social",
    visual: sceneVisuals.delay,
    variant: "reflect",
    banner: "延遲令壓力持續",
    title: "等待不是唯一選擇",
    lead: "事件在小群組裡繼續流傳，Amy 越來越不願意上學，也越來越覺得沒有人會明白。",
    body: "不代表每件事都要公開處理；但主動了解安全、保存必要資料、連結支持和一起商討下一步，能讓受影響的人不必獨自承受。",
    reflection: "反思：當我不確定怎樣做時，誰可以和我一起評估情況，而不是只希望問題自行消失？",
  },
  s5d_end: {
    type: "ending",
    idLabel: "回顧結局",
    role: "social",
    visual: sceneVisuals.confrontation,
    variant: "care",
    banner: "被迫面對，並非被支持",
    title: "安全和準備比「勇敢」更重要",
    lead: "Amy 被要求立刻面對涉事者，感到更害怕，也失去對處理方式的信任。",
    body: "有些情況也許需要對話或修復安排，但這應建立在充足準備、清楚界線、當事人意願和安全評估之上。",
    reflection: "反思：我有沒有先了解當事人現在是否準備好？還有沒有較安全、較少壓力的支持方法？",
  },
  end_support_network: {
    type: "ending",
    idLabel: "故事結局",
    role: "bystander",
    visual: sceneVisuals.bystander,
    variant: "positive",
    banner: "支持網正在形成",
    title: "不轉發，也是一種有力的選擇",
    lead: "你沒有讓傷害內容再擴散，並以關心和求助為 Amy 多連上一條支持線。",
    body: "網絡欺凌不會因一個人而立刻結束；但當受影響的人得到聆聽、支援和安全的選擇，當旁觀者拒絕傳播內容，改變便可以從群組裡的一個人開始。",
    reflection: "帶走的提醒：不要轉發傷害內容；保存必要資料；向可信任的人求助；用尊重的方式陪伴受影響的人。",
  },
  end_silence: {
    type: "ending",
    idLabel: "故事結局",
    role: "bystander",
    visual: sceneVisuals.bystander,
    variant: "reflect",
    banner: "沉默也有後果",
    title: "你仍然可以選擇支持",
    lead: "你沒有直接參與轉發，但群組裡的傷害內容沒有因此停下來。Amy 也未必知道有人看見她正在承受的事。",
    body: "不必獨自和整個群組對抗。私下關心、不轉發、向可信任的老師或成年人反映，都是既安全又有分量的旁觀者行動。",
    reflection: "帶走的提醒：旁觀者不需要做英雄式對抗；可以先做一個不讓傷害擴散、願意連結支持的人。",
  },
  end_forwarding: {
    type: "ending",
    idLabel: "故事結局",
    role: "bystander",
    visual: sceneVisuals.bystander,
    variant: "care",
    banner: "內容再一次被擴散",
    title: "澄清，不必靠再轉發",
    lead: "你原本想提醒朋友，但 Meme 圖和謠言又被更多人看見。",
    body: "面對有害內容時，可以不附上原圖或原文；保留必要資料給能協助的人，私下關心受影響者，並使用平台舉報和學校支援途徑。",
    reflection: "帶走的提醒：想支持一個人，不代表要再次讓傷害內容曝光。",
  },
  end_escalation: {
    type: "ending",
    idLabel: "故事結局",
    role: "bystander",
    visual: sceneVisuals.bystander,
    variant: "care",
    banner: "衝突升溫了",
    title: "反擊不一定能讓傷害停止",
    lead: "群組變成罵戰；更多同學圍觀、截圖，原本的傷害內容再次成為焦點。",
    body: "看見不公平時感到憤怒很自然。但以辱罵回應，常會令內容更加流傳。較安全的選擇是停止轉發、保留必要資料、支持受影響者並尋求成人協助。",
    reflection: "帶走的提醒：把焦點從罵贏對方，轉向怎樣讓受影響的人更安全、更有支持。",
  },
};

function cloneGame(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHTML(value = "") {
  return translate(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function proseHTML(lines = []) {
  return lines.map((line) => `<p>${escapeHTML(line)}</p>`).join("");
}

function labelForScene(scene) {
  if (scene.type === "home") return "故事首頁";
  if (scene.idLabel) return scene.idLabel;
  if (scene.type === "interstitial") return "視角轉換";
  return "故事頁面";
}

function rolePill(role) {
  if (!role || !roleMap[role]) return "";
  return `<span class="perspective-pill" data-role="${role}">${roleMap[role].icon}<span>${escapeHTML(roleMap[role].label)}</span></span>`;
}

function journeyHTML(sceneId) {
  const active = journeyIndex[sceneId] ?? 0;
  const stages = ["Amy 的經歷", "社工的回應", "共同跟進", "旁觀者的選擇"];
  return `<nav class="journey" aria-label="${escapeHTML("故事旅程")}">${stages
    .map((stage, index) => {
      const state = index === active ? "is-active" : index < active ? "is-done" : "";
      return `<div class="journey__step ${state}"><span class="journey__dot"></span><span>${escapeHTML(stage)}</span></div>`;
    })
    .join("")}</nav>`;
}

function topbarHTML() {
  const hasInAppParent = Boolean(history.state?.sceneId) && currentSceneId !== "home";
  return `<header class="topbar">
    <button class="brand" data-action="home" aria-label="${escapeHTML("回到故事首頁")}">
      <span class="brand__mark">${icons.shield}</span>
      <span class="brand__copy">${escapeHTML("Media Heroes · 數碼世界守護者")}</span>
    </button>
    <button class="language-button" data-action="language" aria-label="${language === "en" ? "Switch to Traditional Chinese" : "Switch to English"}">
      <span class="language-button__globe" aria-hidden="true">文/A</span>
      <span>${language === "en" ? "繁體中文" : "English"}</span>
    </button>
    <button class="back-button" data-action="back" ${hasInAppParent ? "" : "aria-disabled=\"true\""}>
      ${icons.back}<span>${escapeHTML("回到上一頁")}</span>
    </button>
  </header>`;
}

function helpNoteHTML() {
  return `<div class="help-note">${icons.info}<span>${escapeHTML("如故事內容令你感到不舒服，請暫停，並向你信任的成年人、老師、學校社工或合適的支援服務求助。")}</span></div>`;
}

function cardTopHTML(scene) {
  return `<div class="scene-topline"><span class="eyebrow">${escapeHTML(labelForScene(scene))}</span>${rolePill(scene.role)}</div>`;
}

function renderVisual(visual, modifier = "") {
  if (!visual) return "";
  return `<figure class="scene-visual ${modifier}">
    <img src="${escapeHTML(visual.src)}" alt="${escapeHTML(visual.alt)}" decoding="async" />
  </figure>`;
}

function renderLesson(lessonKey) {
  const lesson = lessons[lessonKey];
  if (!lesson) return "";
  return `<aside class="learning-card" aria-label="${escapeHTML("Media Heroes 學習提示")}">
    <span class="learning-card__eyebrow">${escapeHTML("Media Heroes · 學習提示")}</span>
    <h2>${escapeHTML(lesson.title.replace("Media Heroes 學習提示｜", ""))}</h2>
    <ol>${lesson.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol>
    <p>${escapeHTML(lesson.note)}</p>
  </aside>`;
}

function renderHome(scene) {
  return `<article id="story" class="story-card" tabindex="-1">
    ${cardTopHTML(scene)}
    <h1 class="title">${escapeHTML(scene.title).replace("\n", "<br />")}</h1>
    <p class="lead">${escapeHTML(scene.lead)}</p>
    ${renderVisual(scene.visual, "scene-visual--hero")}
    <div class="prose">${proseHTML(scene.body)}</div>
    <button class="primary-action" data-go="opening-amy">${escapeHTML("開始故事")} ${icons.arrow}</button>
    ${helpNoteHTML()}
  </article>`;
}

function renderInterstitial(scene) {
  const role = scene.role;
  return `<article id="story" class="story-card interstitial-card" tabindex="-1">
    <div class="interstitial-icon interstitial-icon--${role}">${roleMap[role].icon}</div>
    ${cardTopHTML(scene)}
    <h1 class="scene-title">${escapeHTML(scene.title)}</h1>
    <p class="lead">${escapeHTML(scene.lead)}</p>
    ${renderVisual(scene.visual, "scene-visual--interstitial")}
    <div class="prose">${escapeHTML(scene.body)}</div>
    <div class="mission"><span class="mission__icon">✦</span><span><strong>${escapeHTML("新的任務")}</strong>${escapeHTML(scene.mission)}</span></div>
    <button class="primary-action" data-go="${scene.next}">${escapeHTML(scene.nextLabel)} ${icons.arrow}</button>
    ${helpNoteHTML()}
  </article>`;
}

function renderScene(scene) {
  return `<article id="story" class="story-card" tabindex="-1">
    ${cardTopHTML(scene)}
    <h1 class="scene-title">${escapeHTML(scene.title)}</h1>
    <p class="lead">${escapeHTML(scene.lead)}</p>
    ${renderVisual(scene.visual)}
    <div class="prose">${proseHTML(scene.body)}</div>
    ${scene.quote ? `<blockquote class="quote ${scene.idLabel === "S1" ? "quote--message" : ""}">${escapeHTML(scene.quote)}</blockquote>` : ""}
    <div class="mission"><span class="mission__icon">✦</span><span><strong>${escapeHTML("你的任務")}</strong>${escapeHTML(scene.mission)}</span></div>
    <div class="choices" aria-label="${escapeHTML("可選行動")}">${scene.choices
      .map(
        (choice) => `<button class="choice" data-choice="${choice.key}">
          <span class="choice__letter">${escapeHTML(choice.key.replace(/^.*?([A-E])$/, "$1"))}</span>
          <span class="choice__text">${escapeHTML(choice.label)}</span>
          <span class="choice__arrow" aria-hidden="true">→</span>
        </button>`,
      )
      .join("")}</div>
  </article>`;
}

function renderOutcome() {
  const pending = game.pending;
  if (!pending) {
    goTo("home", { replace: true });
    return "";
  }
  const toneClass = pending.tone === "support" ? "support" : pending.tone === "risk" ? "risk" : "";
  const emblem = pending.tone === "support" ? "✦" : pending.tone === "risk" ? "!" : "…";
  return `<article id="story" class="story-card outcome-card outcome-card--${toneClass}" tabindex="-1">
    <div class="outcome-emblem" aria-hidden="true">${emblem}</div>
    <div class="scene-topline"><span class="eyebrow">${escapeHTML("選擇後的可能影響")}</span>${rolePill(pending.role)}</div>
    <h1 class="scene-title">${escapeHTML(pending.title)}</h1>
    <div class="outcome-copy">${escapeHTML(pending.outcome)}</div>
    ${renderVisual(pending.visual, "scene-visual--outcome")}
    ${renderLesson(pending.lesson)}
    <button class="primary-action" data-action="continue">${escapeHTML("繼續故事")} ${icons.arrow}</button>
    ${helpNoteHTML()}
  </article>`;
}

function renderActionLog() {
  if (!game.actions.length) return "";
  return `<section class="action-log" aria-label="${escapeHTML("守護行動紀錄")}"><h3>${escapeHTML("旅程中的守護行動")}</h3><ul>${game.actions
    .map((action) => `<li>${escapeHTML(action)}</li>`)
    .join("")}</ul></section>`;
}

function renderEnding(scene) {
  const badgeClass = scene.variant === "positive" ? "" : scene.variant === "care" ? "ending-banner--care" : "ending-banner--reflect";
  return `<article id="story" class="story-card" tabindex="-1">
    ${cardTopHTML(scene)}
    <span class="ending-banner ${badgeClass}">✦ ${escapeHTML(scene.banner)}</span>
    <h1 class="scene-title" style="margin-top:1rem">${escapeHTML(scene.title)}</h1>
    <p class="lead">${escapeHTML(scene.lead)}</p>
    ${renderVisual(scene.visual, "scene-visual--ending")}
    <div class="prose"><p>${escapeHTML(scene.body)}</p><p><strong>${escapeHTML(scene.reflection)}</strong></p></div>
    ${renderActionLog()}
    <div class="ending-actions">
      <button class="primary-action" data-action="restart">${escapeHTML("重新探索故事")} ${icons.arrow}</button>
      <button class="secondary-action" data-action="home">${escapeHTML("回到故事首頁")}</button>
    </div>
    ${helpNoteHTML()}
  </article>`;
}

function render() {
  const scene = currentSceneId.startsWith("outcome-") ? null : scenes[currentSceneId] || scenes.home;
  const content = currentSceneId.startsWith("outcome-")
    ? renderOutcome()
    : scene.type === "home"
      ? renderHome(scene)
      : scene.type === "interstitial"
        ? renderInterstitial(scene)
        : scene.type === "ending"
          ? renderEnding(scene)
          : renderScene(scene);

  const app = document.querySelector("#app");
  app.innerHTML = `${topbarHTML()}${journeyHTML(currentSceneId)}${content}<p class="footer-note">${escapeHTML("Media Heroes 是用於網絡欺凌預防、同理及安全討論的學習情境；本互動故事不構成直接個案管理指引。")}</p>`;
  document.documentElement.lang = language === "en" ? "en" : "zh-Hant-HK";
  document.title = language === "en" ? "Media Heroes — Guardians of the Digital World" : "Media Heroes — 數碼世界守護者";
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) skipLink.textContent = escapeHTML("跳到故事內容");

  requestAnimationFrame(() => document.querySelector("#story")?.focus({ preventScroll: true }));
}

function statePayload() {
  return { sceneId: currentSceneId, game: cloneGame(game) };
}

function updateURL() {
  const safeId = currentSceneId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `#${safeId}`;
}

function goTo(sceneId, { replace = false } = {}) {
  currentSceneId = sceneId;
  const state = statePayload();
  if (replace) {
    history.replaceState(state, "", updateURL());
  } else {
    history.pushState(state, "", updateURL());
  }
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function makeChoice(choiceKey) {
  const scene = scenes[currentSceneId];
  const choice = scene?.choices?.find((item) => item.key === choiceKey);
  if (!choice) return;

  if (choice.action && !game.actions.includes(choice.action)) {
    game.actions.push(choice.action);
  }
  game.pending = {
    title: choice.tone === "support" ? "這個選擇正在建立支持" : choice.tone === "risk" ? "這個選擇可能令傷害擴散" : "這個選擇值得再想一想",
    outcome: choice.outcome,
    next: choice.next,
    tone: choice.tone,
    role: scene.role,
    visual: choice.visual || scene.visual,
    lesson: choice.lesson,
  };
  goTo(`outcome-${scene.idLabel || currentSceneId}-${choice.key}`);
}

function continueStory() {
  if (!game.pending) return;
  const { next } = game.pending;
  game.pending = null;
  goTo(next);
}

function restart() {
  game = initialGame();
  goTo("opening-amy");
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = translate(message);
  document.body.append(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.remove(), 2800);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "language") {
    language = language === "en" ? "zh-Hant" : "en";
    localStorage.setItem("mediaHeroesLanguage", language);
    render();
    return;
  }
  if (button.dataset.choice) {
    makeChoice(button.dataset.choice);
    return;
  }
  if (button.dataset.go) {
    goTo(button.dataset.go);
    return;
  }
  if (button.dataset.action === "continue") {
    continueStory();
    return;
  }
  if (button.dataset.action === "restart") {
    restart();
    return;
  }
  if (button.dataset.action === "home") {
    if (currentSceneId === "home") {
      showToast("你已在故事首頁。按「開始故事」可重新進入旅程。");
    } else {
      game = initialGame();
      goTo("home");
    }
    return;
  }
  if (button.dataset.action === "back") {
    if (currentSceneId === "home" || !history.state?.sceneId) {
      showToast("你已在故事首頁。按「開始故事」可進入旅程。");
    } else {
      history.back();
    }
  }
});

window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (!state?.sceneId || !state.game) {
    game = initialGame();
    currentSceneId = "home";
    history.replaceState(statePayload(), "", updateURL());
  } else {
    currentSceneId = state.sceneId;
    game = cloneGame(state.game);
  }
  render();
  window.scrollTo({ top: 0, behavior: "auto" });
});

function init() {
  const saved = history.state;
  const savedSceneIsValid =
    typeof saved?.sceneId === "string" &&
    (saved.sceneId.startsWith("outcome-") || Boolean(scenes[saved.sceneId]));

  if (savedSceneIsValid && saved?.game) {
    currentSceneId = saved.sceneId;
    game = cloneGame(saved.game);
  } else {
    // A bare hash should not skip a required perspective-opening page.
    currentSceneId = "home";
    game = initialGame();
  }
  history.replaceState(statePayload(), "", updateURL());
  render();
}

init();

import mintlyLogo from "@/assets/mintly-logo.png";
import junipLogo from "@/assets/junip-logo.png";

export interface AffiliateLink {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  isNew?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  isNew?: boolean;
  links: AffiliateLink[];
}

export const affiliateData: Category[] = [
  {
    id: "creative-tools",
    name: "Creative Tools",
    emoji: "🎨",
    isNew: true,
    links: [
      {
        id: "creative-os",
        title: "Creative OS | Creative Template Tool",
        description:
          "Browse, filter & select from a pre-designed ad creative library of up 5500+ templates. Created by marketers for marketers",
        thumbnail: "https://i.imgur.com/k37oKdg.png",
        url: "https://creativeos.com/?ref=chase",
      },
      {
        id: "mintly",
        title: "Mintly | AI Ad Creatives",
        description: "Get product-accurate AI video ads, UGC & realistic lifestyle images.",
        thumbnail: mintlyLogo,
        url: "https://usemintly.com/?ref=chase",
        isNew: true,
      },
      {
        id: "arcads",
        title: "Arcads | AI UGC Videos",
        description: "Create Ai UGC Videos",
        thumbnail: "https://i.imgur.com/2hXfUGp.png",
        url: "https://arcads.ai/?via=chase",
      },
      {
        id: "custom-gpt",
        title: "Custom Ad Creative GPT",
        description: "Create Facebook Ads in Seconds with our custom GPT",
        thumbnail: "https://i.imgur.com/q3yY1lD.png",
        url: "https://chatgpt.com/g/g-67ec12cc9128819188c8376f266942ce-ad-creative-gpt",
      },
      {
        id: "butter",
        title: "Butter | Preset Ad Templates",
        description:
          "Explore and remix ad templates from the world's best brands. Create preset video and static ads with ease.",
        thumbnail: "https://i.imgur.com/xyl5rYt.png",
        url: "https://www.usebutter.com/?via=chase",
      },
      {
        id: "creatify",
        title: "Creatify | AI Creatives",
        description: "The fastest way to create Ai Facebook & TikTok Ads. Use Code: VIP25 (25% OFF)",
        thumbnail: "https://i.imgur.com/aRkzj8K.png",
        url: "https://creatify.ai/?via=chase",
      },
    ],
  },
  {
    id: "upsells-bundles",
    name: "Upsells & Bundles",
    emoji: "📦",
    links: [
      {
        id: "kaching-post",
        title: "Kaching Post Purchase",
        description:
          "Flawlessly integrated, Kaching Post Purchase Upsell allows customers to catch irresistible offers immediately after purchase, no re-entry of payment details required - one click is all it takes.",
        thumbnail: "https://i.imgur.com/BXfKE9l.png",
        url: "https://apps.shopify.com/kaching-post-purchase-upsell?mref=ltahunni",
      },
      {
        id: "kaching-cart",
        title: "Kaching AI Cart Drawer | Shopify App",
        description:
          "Boost your AOV with Kaching — the top-rated AI-powered slide cart drawer for smart upsells and seamless checkout in 2025.",
        thumbnail: "https://i.imgur.com/LssJmbD.png",
        url: "https://apps.shopify.com/cart-upsell?mref=ltahunni",
      },
      {
        id: "kaching-bundles",
        title: "Kaching Bundles | Shopify App",
        description: "Increase AOVs with Bundles.",
        thumbnail: "https://i.imgur.com/Wbe7Wr7.png",
        url: "https://apps.shopify.com/bundle-deals?mref=chasechappell",
      },
      {
        id: "rebuy",
        title: "Rebuy | Shopify App",
        description: "Upsells, Post Purchase, Subscriptions, Slide/Drawer Cart, & Progress Bar",
        thumbnail: "https://i.imgur.com/aw6PBur.png",
        url: "https://rebuyengine.com/app-store/shopify?ref=1855",
      },
    ],
  },
  {
    id: "email-sms",
    name: "Email & SMS",
    emoji: "📧",
    links: [
      {
        id: "klaviyo",
        title: "Klaviyo | Email/SMS Marketing",
        description:
          "Automate email and SMS flows with Klaviyo to drive more revenue, recover abandoned checkouts, and keep your customers coming back.",
        thumbnail: "https://i.imgur.com/adbJ6nq.png",
        url: "https://www.klaviyo.com/partner/signup?utm_source=001Nu0000092OdsIAE&utm_medium=partner",
      },
      {
        id: "justuno",
        title: "JustUno | Email Pop Up",
        description:
          "Boost conversions and grow your list with Justuno's pop-ups and on-site offers. (5%-15% Capture Rate)",
        thumbnail: "https://i.imgur.com/EQbwZPD.png",
        url: "https://justuno.partnerlinks.io/b372pmrjeg4u",
      },
      {
        id: "txtcart",
        title: "TxtCart | Shopify App",
        description: "SMS Marketing & Ai Chat Support App for Shopify",
        thumbnail: "https://i.imgur.com/YVzVKFS.png",
        url: "https://apps.shopify.com/txtcart-plus?mref=chaseyoutube",
      },
    ],
  },
  {
    id: "website-design",
    name: "Website Design",
    emoji: "🖥️",
    links: [
      {
        id: "shrine-theme",
        title: "Shrine Theme | Shopify Theme",
        description: "Shrine is a high-converting Shopify theme designed for bold, modern brands—now 15% off.",
        thumbnail: "https://i.imgur.com/6bf84O1.png",
        url: "https://shrinesolutions.com?ref=e35d6e5b",
      },
      {
        id: "sirge",
        title: "Sirge",
        description: "Ai CRO Shopify Recommendations & Facebook/TikTok Ad Tracking",
        thumbnail: "https://i.imgur.com/55xIcgy.png",
        url: "https://www.sirge.com/?utm_source=Chase&utm_medium=Course",
      },
      {
        id: "replo",
        title: "Replo | Shopify App",
        description: "#1 Shopify Theme Builder",
        thumbnail: "https://i.imgur.com/Y8SN2o0.png",
        url: "https://replo.app/signup/chasechappellsworkspace",
      },
    ],
  },
  {
    id: "research",
    name: "Research",
    emoji: "🔍",
    links: [
      {
        id: "winning-hunter",
        title: "Winning Hunter | Spy Tool",
        description: "All in one spy tool + Create Ai Facebook Ad Images that Convert",
        thumbnail: "https://i.imgur.com/IhwTBC8.png",
        url: "https://winninghunter.com/?ref=chase",
      },
      {
        id: "fastmoss",
        title: "FastMoss | TikTok Research",
        description: "Viral TikTok Shop Video Research Tool",
        thumbnail: "https://i.imgur.com/BenorJB.png",
        url: "https://www.fastmoss.com/dashboard?refCode=CC4000",
      },
      {
        id: "foreplay",
        title: "Foreplay | Advanced Ad Library",
        description: "Facebook/TikTok Ad Swipe Files",
        thumbnail: "https://i.imgur.com/U4bpCu1.png",
        url: "https://foreplay.co/?via=chase-chappell",
      },
    ],
  },
  {
    id: "other-shopify-apps",
    name: "Other Shopify Apps",
    emoji: "🛒",
    links: [
      {
        id: "junip",
        title: "Junip Product Reviews | Shopify App",
        description:
          "Get way more reviews from your customers. Junip boasts an industry-leading review submission rate per order. Send review requests for free with no order limit",
        thumbnail: junipLogo,
        url: "https://junip.co/p/partners?mref=ltahunni",
      },
      {
        id: "firework",
        title: "Firework | Shopify App",
        description: "TikTok Shopable Video Feed",
        thumbnail: "https://i.imgur.com/po1axwt.png",
        url: "https://partner.firework.com/7ckxaxyplah7",
      },
      {
        id: "loox",
        title: "Loox | Shopify App",
        description: "Shopify Website Review App",
        thumbnail: "https://i.imgur.com/2eI8qgx.png",
        url: "https://loox.app/",
      },
      {
        id: "repurpose",
        title: "Repurpose | Shopify App",
        description: "Automatically post across all platforms with 1 click",
        thumbnail: "https://i.imgur.com/Zm5gDSZ.png",
        url: "https://repurpose.io/?aff=73885",
      },
    ],
  },
  {
    id: "tiktok-resources",
    name: "TikTok Resources",
    emoji: "🎵",
    links: [
      {
        id: "tiktok-credits",
        title: "Get $6,000 in TikTok Ad Credits",
        description: "Get up to $6,000 in TikTok Ad credits!",
        thumbnail: "https://i.imgur.com/lDL5jFU.png",
        url: "https://getstartedtiktok.pxf.io/c/1930736/1359578/16372",
      },
      {
        id: "euka",
        title: "Euka | TikTok Affiliate Outreach",
        description: "Get 100s of TikTok Affiliates with this automated tool.",
        thumbnail: "https://i.imgur.com/9OrBnSX.png",
        url: "https://www.euka.ai/?ref=chase",
      },
    ],
  },
  {
    id: "other-resources",
    name: "Other Resources",
    emoji: "⚡",
    links: [
      {
        id: "parker-card",
        title: "Parker Card | Ecommerce Cash Flow",
        description:
          "Parker Card offers e-commerce brands up to 90-day payment terms and flexible credit limits to optimize cash flow.",
        thumbnail: "https://i.imgur.com/pIxNPzk.png",
        url: "https://www.getparker.com/lp/chase-partner?eid=fDcyUw",
      },
      {
        id: "doe-media",
        title: "Hire My Agency To Manage Ads For You",
        description:
          "A world-class full-funnel direct response advertising firm providing scalable performance marketing solutions.",
        thumbnail: "https://i.imgur.com/ZQBAi6Q.png",
        url: "https://doemedia.com/doemedia-x-chappell/?utm_source=ChaseChappell&utm_medium=course",
      },
      {
        id: "canva",
        title: "Canva",
        description: "Ad Templates, Website Images, Icons, Templates, Background Remover.",
        thumbnail: "https://i.imgur.com/TZzvqio.png",
        url: "https://www.canva.com/",
      },
      {
        id: "shopify-store",
        title: "$1 Shopify Store",
        description: "Ecommerce Platform",
        thumbnail: "https://i.imgur.com/lqlFhgd.png",
        url: "http://shopify.pxf.io/AWmr0R",
      },
    ],
  },
];

export type OfficeLocale = "vi" | "en" | "ja" | "zh";

export type LocalizedText = Record<OfficeLocale, string>;

export type Office = {
  id: string;
  city: LocalizedText;
  label: "HEAD OFFICE" | "BRANCH";
  address: LocalizedText;
  country: "Viet Nam" | "Japan";
  isHeadOffice?: boolean;
  mapsQuery: string;
};

export const offices: Office[] = [
  {
    id: "hanoi",
    city: { vi: "HÀ NỘI", en: "HANOI", ja: "ハノイ", zh: "河内" },
    label: "HEAD OFFICE",
    address: {
      vi: "Tầng 2, Gemek Tower 1, An Khánh, Hà Nội",
      en: "2nd Floor, Gemek Tower 1, An Khanh, Hanoi",
      ja: "Gemek Tower 1 2階, アンカイン, ハノイ",
      zh: "Gemek Tower 1 2层, An Khanh, 河内",
    },
    country: "Viet Nam",
    isHeadOffice: true,
    mapsQuery: "Gemek+Tower+1+An+Khanh+Hanoi",
  },
  {
    id: "danang",
    city: { vi: "ĐÀ NẴNG", en: "DANANG", ja: "ダナン", zh: "岘港" },
    label: "BRANCH",
    address: {
      vi: "132 đường Xuân Thủy, Cẩm Lệ, Đà Nẵng",
      en: "132 Xuan Thuy Street, Cam Le, Da Nang",
      ja: "132 Xuan Thuy通り, カムレー区, ダナン",
      zh: "132 Xuan Thuy街, Cẩm Lệ, 岘港",
    },
    country: "Viet Nam",
    mapsQuery: "132+Xuan+Thuy+Cam+Le+Da+Nang",
  },
  {
    id: "hcm",
    city: { vi: "TP. HCM", en: "HO CHI MINH CITY", ja: "ホーチミン", zh: "胡志明市" },
    label: "BRANCH",
    address: {
      vi: "67 phường Bàn Cờ, Quận 3, TP. Hồ Chí Minh",
      en: "67 Ban Co Ward, District 3, Ho Chi Minh City",
      ja: "67 Ban Co Ward, District 3, ホーチミン",
      zh: "67 Ban Co坊, 第3郡, 胡志明市",
    },
    country: "Viet Nam",
    mapsQuery: "67+Ban+Co+Ward+District+3+Ho+Chi+Minh+City",
  },
  {
    id: "tokyo",
    city: { vi: "TOKYO", en: "TOKYO", ja: "東京", zh: "东京" },
    label: "BRANCH",
    address: {
      vi: "2-10-3 Minami-Ikebukuro, Toshima-ku, Tokyo",
      en: "2-10-3 Minami-Ikebukuro, Toshima-ku, Tokyo",
      ja: "東京都豊島区南池袋2-10-3",
      zh: "东京都丰岛区南池袋2-10-3",
    },
    country: "Japan",
    mapsQuery: "2-10-3+Minami-Ikebukuro+Toshima-ku+Tokyo",
  },
];

export const CONTACT = {
  brand: "AME MARKETING",
  email: "amemartech@gmail.com",
  phoneDisplay: "+84 941 076 762",
  phoneTel: "+84941076762",
  whatsappUrl: "https://wa.me/84941076762",
  whatsappLabel: "CHAT VIA WHATSAPP",
};

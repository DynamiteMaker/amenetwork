export type Office = {
  id: string;
  city: string;
  label: "HEAD OFFICE" | "BRANCH";
  address: string;
  country: "Viet Nam" | "Japan";
  isHeadOffice?: boolean;
  mapsQuery: string;
};

export const offices: Office[] = [
  {
    id: "hanoi",
    city: "HANOI",
    label: "HEAD OFFICE",
    address: "2nd Floor, Gemek 1 Building, An Khanh, Hanoi, Viet Nam",
    country: "Viet Nam",
    isHeadOffice: true,
    mapsQuery: "Gemek+1+Tower+An+Khanh+Hanoi",
  },
  {
    id: "danang",
    city: "DANANG",
    label: "BRANCH",
    address: "Nguyen Thi Minh Khai, Hai Chau, Da Nang, Viet Nam",
    country: "Viet Nam",
    mapsQuery: "Nguyen+Thi+Minh+Khai+Hai+Chau+Da+Nang",
  },
  {
    id: "hcm",
    city: "TP. HCM",
    label: "BRANCH",
    address: "Nguyen Van Linh Street, District 7, Ho Chi Minh City, Viet Nam",
    country: "Viet Nam",
    mapsQuery: "Nguyen+Van+Linh+District+7+Ho+Chi+Minh+City",
  },
  {
    id: "tokyo",
    city: "TOKYO",
    label: "BRANCH",
    address: "2-10-3 Minami-Ikebukuro, Toshima-ku, Tokyo 171-0022, Japan",
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

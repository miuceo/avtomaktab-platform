export interface SeedRoadSign {
  code: string;
  group_uz: string;
  group_ru: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  svgType: "warning" | "priority_main" | "priority_yield" | "priority_stop" | "prohibition" | "mandatory" | "info";
  label: string;
  ru_reviewed: boolean;
}

export const SEED_TOPICS = [
  {
    name_uz: "Umumiy qoidalar va haydovchi majburiyatlari",
    name_ru: "Общие положения и обязанности водителей",
    ru_reviewed: true,
  },
  {
    name_uz: "Yo'l belgilari va yo'l chiziqlari",
    name_ru: "Дорожные знаки и дорожная разметка",
    ru_reviewed: true,
  },
  {
    name_uz: "Svetofor va tartibga soluvchining ishoralari",
    name_ru: "Сигналы светофора и регулировщика",
    ru_reviewed: true,
  },
  {
    name_uz: "Harakatlanishni boshlash va manyovr qilish",
    name_ru: "Начало движения и маневрирование",
    ru_reviewed: true,
  },
  {
    name_uz: "Harakat tezligi va quvib o'tish",
    name_ru: "Скорость движения и обгон",
    ru_reviewed: true,
  },
  {
    name_uz: "Chorrahalarda harakatlanish",
    name_ru: "Проезд перекрестков",
    ru_reviewed: false,
  },
  {
    name_uz: "To'xtash va to'xtab turish qoidalari",
    name_ru: "Остановка и стоянка",
    ru_reviewed: true,
  },
  {
    name_uz: "Texnik holat va birinchi tibbiy yordam",
    name_ru: "Техническое состояние и первая медицинская помощь",
    ru_reviewed: false,
  },
];

export const SEED_ROAD_SIGNS: SeedRoadSign[] = [
  // 1. Ogohlantiruvchi belgilar (Warning signs)
  {
    code: "1.1",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Shlagbaumli temir yo'l kesishmasi",
    name_ru: "Железнодорожный переезд со шлагбаумом",
    description_uz: "Haydovchini shlagbaum bilan jihozlangan temir yo'l kesishmasiga yaqinlashayotgani haqida ogohlantiradi.",
    description_ru: "Предупреждает о приближении к железнодорожному переезду со шлагбаумом.",
    svgType: "warning",
    label: "1.1",
    ru_reviewed: true,
  },
  {
    code: "1.2",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Shlagbaumsiz temir yo'l kesishmasi",
    name_ru: "Железнодорожный переезд без шлагбаума",
    description_uz: "Shlagbaum bilan jihozlanmagan temir yo'l kesishmasiga yaqinlashayotganlik haqida ogohlantiradi.",
    description_ru: "Предупреждает о приближении к железнодорожному переезду без шлагбаума.",
    svgType: "warning",
    label: "1.2",
    ru_reviewed: true,
  },
  {
    code: "1.8",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Svetofor tartibga soladi",
    name_ru: "Светофорное регулирование",
    description_uz: "Harakat svetofor orqali tartibga solinadigan chorraha yoki piyodalar o'tish joyi.",
    description_ru: "Перекресток или пешеходный переход, движение на котором регулируется светофором.",
    svgType: "warning",
    label: "🚦",
    ru_reviewed: true,
  },
  {
    code: "1.11.1",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Xavfli burilish (o'ngga)",
    name_ru: "Опасный поворот (направо)",
    description_uz: "Kichik radiusli yoki ko'rinishi cheklangan o'ngga burilish.",
    description_ru: "Закругление дороги малого радиуса или с ограниченной видимостью направо.",
    svgType: "warning",
    label: "↱",
    ru_reviewed: true,
  },
  {
    code: "1.15",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Sirpanchiq yo'l",
    name_ru: "Скользкая дорога",
    description_uz: "Qatnov qismi sirpanchiq bo'lgan yo'l qismiga yaqinlashish.",
    description_ru: "Участок дороги с повышенной скользкостью проезжей части.",
    svgType: "warning",
    label: "≈",
    ru_reviewed: true,
  },
  {
    code: "1.20",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Piyodalar o'tish joyi",
    name_ru: "Пешеходный переход",
    description_uz: "Belgilar va chiziqlar bilan ajratilgan piyodalar o'tish joyiga yaqinlashish.",
    description_ru: "Приближение к нерегулируемому пешеходному переходу.",
    svgType: "warning",
    label: "🚶",
    ru_reviewed: true,
  },
  {
    code: "1.21",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Bolalar",
    name_ru: "Дети",
    description_uz: "Maktab, bog'cha va bolalar muassasalari yaqinidagi yo'l qismi.",
    description_ru: "Участок дороги вблизи детского учреждения (школы, детсада).",
    svgType: "warning",
    label: "🚸",
    ru_reviewed: true,
  },
  {
    code: "1.23",
    group_uz: "1. Ogohlantiruvchi belgilar",
    group_ru: "1. Предупреждающие знаки",
    name_uz: "Ta'mirlash ishlari",
    name_ru: "Дорожные работы",
    description_uz: "Yo'lda qurilish yoki ta'mirlash ishlari olib borilayotgan qism.",
    description_ru: "Участок дороги, на котором ведутся ремонтные работы.",
    svgType: "warning",
    label: "⛏",
    ru_reviewed: false,
  },
  // 2. Imtiyoz belgilari (Priority signs)
  {
    code: "2.1",
    group_uz: "2. Imtiyoz belgilari",
    group_ru: "2. Знаки приоритета",
    name_uz: "Asosiy yo'l",
    name_ru: "Главная дорога",
    description_uz: "Tartibga solinmagan chorrahalarda o'tish huquqini beruvchi yo'l.",
    description_ru: "Дорога, на которой предоставлено право преимущественного проезда нерегулируемых перекрестков.",
    svgType: "priority_main",
    label: "2.1",
    ru_reviewed: true,
  },
  {
    code: "2.2",
    group_uz: "2. Imtiyoz belgilari",
    group_ru: "2. Знаки приоритета",
    name_uz: "Asosiy yo'lning oxiri",
    name_ru: "Конец главной дороги",
    description_uz: "2.1 belgisining amal qilish hududi tugaganini bildiradi.",
    description_ru: "Отменяет право преимущественного проезда перекрестков.",
    svgType: "priority_main",
    label: "END",
    ru_reviewed: true,
  },
  {
    code: "2.4",
    group_uz: "2. Imtiyoz belgilari",
    group_ru: "2. Знаки приоритета",
    name_uz: "Yo'l bering",
    name_ru: "Уступите дорогу",
    description_uz: "Haydovchi kesib o'tilayotgan yo'ldan kelayotgan transport vositalariga yo'l berishi shart.",
    description_ru: "Водитель должен уступить дорогу транспортным средствам, движущимся по пересекаемой дороге.",
    svgType: "priority_yield",
    label: "▽",
    ru_reviewed: true,
  },
  {
    code: "2.5",
    group_uz: "2. Imtiyoz belgilari",
    group_ru: "2. Знаки приоритета",
    name_uz: "To'xtamasdan harakatlanish taqiqlangan",
    name_ru: "Движение без остановки запрещено",
    description_uz: "To'xtash chizig'i oldida, agar u bo'lmasa — kesishadigan qatnov qismi chetida to'xtamasdan o'tish taqiqlanadi.",
    description_ru: "Запрещается движение без остановки перед стоп-линией, а если ее нет — перед краем пересекаемой проезжей части.",
    svgType: "priority_stop",
    label: "STOP",
    ru_reviewed: true,
  },
  {
    code: "2.6",
    group_uz: "2. Imtiyoz belgilari",
    group_ru: "2. Знаки приоритета",
    name_uz: "Ro'paradan harakatlanishning ustunligi",
    name_ru: "Преимущество встречного движения",
    description_uz: "Yo'lning tor qismida qarama-qarshi kelayotgan transportga yo'l berish zarurligi.",
    description_ru: "Запрещается въезд на узкий участок дороги, если это затруднит встречное движение.",
    svgType: "prohibition",
    label: "↓↑",
    ru_reviewed: true,
  },
  // 3. Taqiqlovchi belgilar (Prohibitory signs)
  {
    code: "3.1",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Kirish taqiqlangan",
    name_ru: "Въезд запрещен",
    description_uz: "Barcha transport vositalarining ushbu yo'nalishda kirishini taqiqlaydi (yo'nalishli transport vositalaridan tashqari).",
    description_ru: "Запрещается въезд всех транспортных средств в данном направлении (кроме маршрутных ТС).",
    svgType: "prohibition",
    label: "—",
    ru_reviewed: true,
  },
  {
    code: "3.2",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Harakatlanish taqiqlangan",
    name_ru: "Движение запрещено",
    description_uz: "Barcha transport vositalarining harakatlanishini taqiqlaydi.",
    description_ru: "Запрещается движение всех транспортных средств.",
    svgType: "prohibition",
    label: "○",
    ru_reviewed: true,
  },
  {
    code: "3.18.1",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "O'ngga burilish taqiqlanadi",
    name_ru: "Поворот направо запрещен",
    description_uz: "Faqat birinchi kesishmada o'ngga burilishni taqiqlaydi.",
    description_ru: "Запрещает поворот направо только на первом пересечении проезжих частей.",
    svgType: "prohibition",
    label: "↱✕",
    ru_reviewed: true,
  },
  {
    code: "3.18.2",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Chapga burilish taqiqlanadi",
    name_ru: "Поворот налево запрещен",
    description_uz: "Chapga burilishni taqiqlaydi, bunda qayrilib olishga ruxsat etiladi.",
    description_ru: "Запрещает поворот налево, при этом разворот разрешается.",
    svgType: "prohibition",
    label: "↰✕",
    ru_reviewed: true,
  },
  {
    code: "3.19",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Qayrilib olish taqiqlangan",
    name_ru: "Разворот запрещен",
    description_uz: "Qayrilib olishni taqiqlaydi, chapga burilishga ruxsat etiladi.",
    description_ru: "Запрещает разворот, при этом поворот налево разрешается.",
    svgType: "prohibition",
    label: "↶✕",
    ru_reviewed: true,
  },
  {
    code: "3.20",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Quvib o'tish taqiqlangan",
    name_ru: "Обгон запрещен",
    description_uz: "Barcha transport vositalarini quvib o'tish taqiqlanadi (yakka holda soatiga 30 km dan kam tezlikda harakatlanayotganlardan tashqari).",
    description_ru: "Запрещается обгон всех ТС, кроме одиночных, движущихся со скоростью менее 30 км/ч.",
    svgType: "prohibition",
    label: "🚗🚗",
    ru_reviewed: true,
  },
  {
    code: "3.24",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "Yuqori tezlik cheklangan (50 km/soat)",
    name_ru: "Ограничение максимальной скорости (50 км/ч)",
    description_uz: "Belgidagi ko'rsatkichi (km/soat) dan yuqori tezlikda harakatlanish taqiqlanadi.",
    description_ru: "Запрещается движение со скоростью (км/ч), превышающей указанную на знаке.",
    svgType: "prohibition",
    label: "50",
    ru_reviewed: true,
  },
  {
    code: "3.27",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "To'xtash taqiqlangan",
    name_ru: "Остановка запрещена",
    description_uz: "Transport vositalarining to'xtashi va to'xtab turishi taqiqlanadi.",
    description_ru: "Запрещаются остановка и стоянка транспортных средств.",
    svgType: "prohibition",
    label: "✕",
    ru_reviewed: true,
  },
  {
    code: "3.28",
    group_uz: "3. Taqiqlovchi belgilar",
    group_ru: "3. Запрещающие знаки",
    name_uz: "To'xtab turish taqiqlangan",
    name_ru: "Стоянка запрещена",
    description_uz: "Transport vositalarining to'xtab turishi taqiqlanadi (to'xtashga ruxsat beriladi).",
    description_ru: "Запрещается стоянка транспортных средств (остановка разрешена).",
    svgType: "prohibition",
    label: "╱",
    ru_reviewed: false,
  },
  // 4. Buyuruvchi belgilar (Mandatory signs)
  {
    code: "4.1.1",
    group_uz: "4. Buyuruvchi belgilar",
    group_ru: "4. Предписывающие знаки",
    name_uz: "Harakatlanish to'g'riga",
    name_ru: "Движение прямо",
    description_uz: "Faqat to'g'riga harakatlanishga ruxsat etiladi.",
    description_ru: "Разрешается движение только прямо.",
    svgType: "mandatory",
    label: "↑",
    ru_reviewed: true,
  },
  {
    code: "4.1.2",
    group_uz: "4. Buyuruvchi belgilar",
    group_ru: "4. Предписывающие знаки",
    name_uz: "Harakatlanish o'ngga",
    name_ru: "Движение направо",
    description_uz: "Faqat o'ngga harakatlanishga ruxsat etiladi.",
    description_ru: "Разрешается движение только направо.",
    svgType: "mandatory",
    label: "→",
    ru_reviewed: true,
  },
  {
    code: "4.1.4",
    group_uz: "4. Buyuruvchi belgilar",
    group_ru: "4. Предписывающие знаки",
    name_uz: "Harakatlanish to'g'riga yoki o'ngga",
    name_ru: "Движение прямо или направо",
    description_uz: "Faqat to'g'riga yoki o'ngga harakatlanishga ruxsat etiladi.",
    description_ru: "Разрешается движение только прямо или направо.",
    svgType: "mandatory",
    label: "↑→",
    ru_reviewed: true,
  },
  {
    code: "4.3",
    group_uz: "4. Buyuruvchi belgilar",
    group_ru: "4. Предписывающие знаки",
    name_uz: "Aylanma harakatlanish",
    name_ru: "Круговое движение",
    description_uz: "Strelkalar ko'rsatgan yo'nalishda aylanma chorrahada harakatlanish buyuriladi.",
    description_ru: "Разрешается движение в указанном стрелками направлении на круговом перекрестке.",
    svgType: "mandatory",
    label: "↻",
    ru_reviewed: true,
  },
  {
    code: "4.6",
    group_uz: "4. Buyuruvchi belgilar",
    group_ru: "4. Предписывающие знаки",
    name_uz: "Eng kam tezlik cheklangan (40 km/soat)",
    name_ru: "Ограничение минимальной скорости (40 км/ч)",
    description_uz: "Faqat ko'rsatilgan yoki undan yuqori tezlikda (km/soat) harakatlanishga ruxsat etiladi.",
    description_ru: "Разрешается движение только с указанной или большей скоростью (км/ч).",
    svgType: "mandatory",
    label: "40",
    ru_reviewed: true,
  },
  // 5. Axborot-ishora va servis belgilari (Information & Service signs)
  {
    code: "5.15",
    group_uz: "5. Axborot-ishora belgilari",
    group_ru: "5. Информационно-указательные знаки",
    name_uz: "To'xtab turish joyi (Parkovka)",
    name_ru: "Место стоянки (Парковка)",
    description_uz: "Transport vositalarining to'xtab turishi uchun maxsus ajratilgan maydon.",
    description_ru: "Специально отведенная площадка для стоянки транспортных средств.",
    svgType: "info",
    label: "P",
    ru_reviewed: true,
  },
  {
    code: "5.16.1",
    group_uz: "5. Axborot-ishora belgilari",
    group_ru: "5. Информационно-указательные знаки",
    name_uz: "Piyodalar o'tish joyi",
    name_ru: "Пешеходный переход",
    description_uz: "Piyodalar qatnov qismidan kesib o'tadigan hududni bildiradi.",
    description_ru: "Обозначает зону для перехода пешеходов через проезжую часть.",
    svgType: "info",
    label: "🚶",
    ru_reviewed: true,
  },
  {
    code: "6.3",
    group_uz: "6. Servis belgilari",
    group_ru: "6. Знаки сервиса",
    name_uz: "Avtomobillarga yonilg'i quyish shoxobchasi",
    name_ru: "Автозаправочная станция",
    description_uz: "Yoqilg'i quyish shoxobchasi joylashgan joyni bildiradi.",
    description_ru: "Указывает расположение автозаправочной станции.",
    svgType: "info",
    label: "⛽",
    ru_reviewed: true,
  },
];

export interface SeedQuestion {
  topicIndex: number; // 0..7
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  explanation_uz: string;
  explanation_ru: string;
  ru_reviewed: boolean;
  answers: Array<{
    text_uz: string;
    text_ru: string;
    is_correct: boolean;
  }>;
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  // Topic 0: Umumiy qoidalar va haydovchi majburiyatlari (5 questions)
  {
    topicIndex: 0,
    text_uz: "O'zbekiston Respublikasi YHQga ko'ra «Yetarlicha ko'rinmaslik» deganda nima tushuniladi?",
    text_ru: "Что означает понятие «Недостаточная видимость» согласно ПДД Республики Узбекистан?",
    image_path: null,
    explanation_uz: "Yomg'ir, qor, tuman yoki g'ira-shira tufayli yo'lning ko'rinishi 300 metrdan kam bo'lishi yetarlicha ko'rinmaslik hisoblanadi.",
    explanation_ru: "Недостаточная видимость — видимость дороги менее 300 м в условиях тумана, дождя, снегопада, а также в сумерки.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Tuman, yomg'ir, qor yog'ishi va g'ira-shira paytida yo'lning ko'rinishi 300 metrdan kam bo'lishi", text_ru: "Видимость дороги менее 300 м в условиях тумана, дождя, снегопада или сумерек", is_correct: true },
      { text_uz: "Yo'lning ko'rinishi 150 metrdan kam bo'lishi", text_ru: "Видимость дороги менее 150 м", is_correct: false },
      { text_uz: "Faqat tungi vaqtda yo'lning yoritilmagan qismi", text_ru: "Только неосвещенный участок дороги в ночное время", is_correct: false },
    ],
  },
  {
    topicIndex: 0,
    text_uz: "Mexanik transport vositasining haydovchisi harakat boshlashdan oldin yo'lovchilar xavfsizligi uchun nimani ta'minlashi shart?",
    text_ru: "Что обязан сделать водитель механического ТС перед началом движения для безопасности пассажиров?",
    image_path: null,
    explanation_uz: "Haydovchi o'zi xavfsizlik kamarini taqishi va xavfsizlik kamari bilan jihozlangan transport vositasida yo'lovchilar ham kamar taqqanligiga ishonch hosil qilishi shart.",
    explanation_ru: "Водитель обязан быть пристегнутым и не перевозить пассажиров, не пристегнутых ремнями безопасности.",
    ru_reviewed: true,
    answers: [
      { text_uz: "O'zi xavfsizlik kamarini taqishi va yo'lovchilar ham taqqanini tekshirishi", text_ru: "Пристегнуться ремнем безопасности самому и убедиться, что пристегнуты пассажиры", is_correct: true },
      { text_uz: "Faqat old o'rindiqdagi yo'lovchi kamar taqqanini tekshirishi", text_ru: "Проверить ремень только у пассажира на переднем сиденье", is_correct: false },
      { text_uz: "Shahar ichida xavfsizlik kamarini taqish majburiy emas", text_ru: "В населенном пункте ремень безопасности необязателен", is_correct: false },
    ],
  },
  {
    topicIndex: 0,
    text_uz: "Yo'l-transport hodisasi (YTH) sodir bo'lganda haydovchining birinchi navbatdagi majburiyati nima?",
    text_ru: "Какова первоочередная обязанность водителя при дорожно-транспортном происшествии (ДТП)?",
    image_path: null,
    explanation_uz: "YTH sodir bo'lganda haydovchi darhol transport vositasini to'xtatishi, avariya ishorasini yoqishi va avariya sababli to'xtash belgisini o'rnatishi, jabrlanganlarga yordam ko'rsatishi shart.",
    explanation_ru: "При ДТП водитель обязан немедленно остановить ТС, включить аварийную сигнализацию, выставить знак аварийной остановки и оказать помощь пострадавшим.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Darhol to'xtash, avariya ishorasini yoqish, belgi o'rnatish va jabrlanganlarga yordam berish", text_ru: "Немедленно остановиться, включить аварийную сигнализацию, выставить знак и помочь пострадавшим", is_correct: true },
      { text_uz: "Avtomobilni yo'l chetiga olib chiqib keyin IIBga qo'ng'iroq qilish", text_ru: "Отъехать на обочину и затем позвонить в милицию", is_correct: false },
      { text_uz: "Eng yaqin YPX maskaniga borib xabar berish", text_ru: "Доехать до ближайшего поста ДПС и сообщить о ДТП", is_correct: false },
    ],
  },
  {
    topicIndex: 0,
    text_uz: "Harakat vaqtida haydovchiga telefondan foydalanishga ruxsat etiladimi?",
    text_ru: "Разрешается ли водителю пользоваться телефоном во время движения?",
    image_path: null,
    explanation_uz: "O'zbekiston YHQga ko'ra transport vositasini boshqarish vaqtida telefondan (shu jumladan qo'llarni band qilmasdan gaplashish moslamalaridan) foydalanish taqiqlanadi.",
    explanation_ru: "Согласно ПДД РУз пользование телефоном во время управления транспортным средством запрещено.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Taqiqlanadi", text_ru: "Запрещается", is_correct: true },
      { text_uz: "Past tezlikda harakatlanganda ruxsat etiladi", text_ru: "Разрешается при движении на малой скорости", is_correct: false },
      { text_uz: "Faqat qisqa SMS yozishga ruxsat etiladi", text_ru: "Разрешается только для отправки коротких СМС", is_correct: false },
    ],
  },
  {
    topicIndex: 0,
    text_uz: "«B» toifadagi transport vositalariga ruxsat etilgan to'la vazni qancha bo'lgan avtomobillar kiradi?",
    text_ru: "Какие автомобили относятся к категории «B» по разрешенной максимальной массе?",
    image_path: null,
    explanation_uz: "«B» toifaga ruxsat etilgan to'la vazni 3500 kg dan oshmaydigan va haydovchi o'rindig'idan tashqari o'rindiqlar soni 8 tadan oshmaydigan avtomobillar kiradi.",
    explanation_ru: "К категории «B» относятся автомобили, разрешенная максимальная масса которых не превышает 3500 кг и число сидячих мест, помимо сиденья водителя, не превышает 8.",
    ru_reviewed: true,
    answers: [
      { text_uz: "To'la vazni 3500 kg gacha va yo'lovchi o'rindiqlari 8 tadan oshmaydigan avtomobillar", text_ru: "Полной массой до 3500 кг и числом пассажирских мест не более 8", is_correct: true },
      { text_uz: "To'la vazni 5000 kg gacha bo'lgan barcha avtomobillar", text_ru: "Все автомобили полной массой до 5000 кг", is_correct: false },
      { text_uz: "Yo'lovchi o'rindiqlari 16 tagacha bo'lgan mikroavtobuslar", text_ru: "Микроавтобусы с числом мест до 16", is_correct: false },
    ],
  },

  // Topic 1: Yo'l belgilari va yo'l chiziqlari (5 questions)
  {
    topicIndex: 1,
    text_uz: "Ushbu «2.5 STOP» belgisi oldida haydovchi qayerda to'xtashi shart?",
    text_ru: "Где обязан остановиться водитель перед данным знаком «2.5 STOP»?",
    image_path: "/seed/signs/2.5.svg",
    explanation_uz: "2.5 belgisi o'rnatilganda haydovchi to'xtash chizig'i oldida, agar u bo'lmasa — kesishadigan qatnov qismi chetida to'xtashi shart.",
    explanation_ru: "При наличии знака 2.5 водитель обязан остановиться перед стоп-линией, а если ее нет — перед краем пересекаемой проезжей части.",
    ru_reviewed: true,
    answers: [
      { text_uz: "To'xtash chizig'i oldida, agar u bo'lmasa — kesib o'tiladigan qatnov qismi chetida", text_ru: "Перед стоп-линией, а если ее нет — перед краем пересекаемой проезжей части", is_correct: true },
      { text_uz: "Aynan belgi o'rnatilgan ustun yonida", text_ru: "Непосредственно у стойки дорожного знака", is_correct: false },
      { text_uz: "Agar yo'lda boshqa mashina bo'lmasa, to'xtamasdan o'tish mumkin", text_ru: "Если нет других машин, можно проехать без остановки", is_correct: false },
    ],
  },
  {
    topicIndex: 1,
    text_uz: "3.18.2 «Chapga burilish taqiqlanadi» belgisi qayrilib olishni ham taqiqlaydimi?",
    text_ru: "Запрещает ли знак 3.18.2 «Поворот налево запрещен» выполнение разворота?",
    image_path: "/seed/signs/3.18.2.svg",
    explanation_uz: "3.18.2 belgisi faqat chapga burilishni taqiqlaydi, qayrilib olishga esa ruxsat etiladi.",
    explanation_ru: "Знак 3.18.2 запрещает только поворот налево, при этом разворот разрешается.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Yo'q, qayrilib olishga ruxsat etiladi", text_ru: "Нет, разворот разрешается", is_correct: true },
      { text_uz: "Ha, ham chapga burilish, ham qayrilib olish taqiqlanadi", text_ru: "Да, запрещены и поворот налево, и разворот", is_correct: false },
      { text_uz: "Faqat kunduz kuni qayrilib olish mumkin", text_ru: "Разворот разрешен только в светлое время суток", is_correct: false },
    ],
  },
  {
    topicIndex: 1,
    text_uz: "Vaqtinchalik (sariq fondagi) yo'l belgilari doimiy yo'l belgilari bilan zid kelsa, haydovchi qaysi biriga amal qilishi kerak?",
    text_ru: "Чем должен руководствоваться водитель, если временные дорожные знаки противоречат постоянным?",
    image_path: null,
    explanation_uz: "Vaqtinchalik yo'l belgilari doimiy belgilar va chiziqlardan ustun hisoblanadi.",
    explanation_ru: "Водители должны руководствоваться требованиями временных дорожных знаков, которые имеют приоритет над постоянными.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Vaqtinchalik yo'l belgilariga", text_ru: "Временными дорожными знаками", is_correct: true },
      { text_uz: "Doimiy yo'l belgilariga", text_ru: "Постоянными дорожными знаками", is_correct: false },
      { text_uz: "Yo'lning yotiq chiziqlariga", text_ru: "Горизонтальной дорожной разметкой", is_correct: false },
    ],
  },
  {
    topicIndex: 1,
    text_uz: "3.19 «Qayrilib olish taqiqlangan» belgisi ta'sirida qaysi yo'nalishlarda harakatlanish mumkin?",
    text_ru: "В каких направлениях разрешено движение в зоне действия знака 3.19 «Разворот запрещен»?",
    image_path: "/seed/signs/3.19.svg",
    explanation_uz: "3.19 belgisi faqat qayrilib olishni taqiqlaydi; to'g'riga, o'ngga va chapga harakatlanishga ruxsat etiladi.",
    explanation_ru: "Знак 3.19 запрещает только разворот; движение прямо, направо и налево разрешено.",
    ru_reviewed: true,
    answers: [
      { text_uz: "To'g'riga, o'ngga va chapga", text_ru: "Прямо, направо и налево", is_correct: true },
      { text_uz: "Faqat to'g'riga va o'ngga", text_ru: "Только прямо и направо", is_correct: false },
      { text_uz: "Faqat to'g'riga", text_ru: "Только прямо", is_correct: false },
    ],
  },
  {
    topicIndex: 1,
    text_uz: "4.1.4 «Harakatlanish to'g'riga yoki o'ngga» belgisi chorraha oldida o'rnatilgan bo'lsa, qayrilib olish mumkinmi?",
    text_ru: "Разрешен ли разворот на перекрестке, перед которым установлен знак 4.1.4 «Движение прямо или направо»?",
    image_path: "/seed/signs/4.1.4.svg",
    explanation_uz: "4.1.4 buyuruvchi belgisi faqat ko'rsatilgan yo'nalishlarda (to'g'riga va o'ngga) yurishni buyuradi; chapga burilish va qayrilib olish taqiqlanadi.",
    explanation_ru: "Предписывающий знак 4.1.4 разрешает движение только прямо или направо; поворот налево и разворот запрещены.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Taqiqlanadi, faqat to'g'riga va o'ngga harakatlanish mumkin", text_ru: "Запрещен, движение разрешено только прямо или направо", is_correct: true },
      { text_uz: "Chap chetki bo'lakdan qayrilib olish mumkin", text_ru: "Разрешен с крайней левой полосы", is_correct: false },
      { text_uz: "Qarama-qarshi transport bo'lmasa ruxsat etiladi", text_ru: "Разрешен при отсутствии встречного транспорта", is_correct: false },
    ],
  },

  // Topic 2: Svetofor va tartibga soluvchining ishoralari (5 questions)
  {
    topicIndex: 2,
    text_uz: "Svetoforning miltillovchi sariq ishorasi nimani bildiradi?",
    text_ru: "Что означает желтый мигающий сигнал светофора?",
    image_path: "/seed/signs/1.8.svg",
    explanation_uz: "Miltillovchi sariq ishora harakatlanishga ruxsat beradi va tartibga solinmagan chorraha yoki piyodalar o'tish joyi borligi haqida ogohlantiradi.",
    explanation_ru: "Желтый мигающий сигнал разрешает движение и информирует о наличии нерегулируемого перекрестка или пешеходного перехода.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Harakatga ruxsat beradi va tartibga solinmagan chorraha haqida ogohlantiradi", text_ru: "Разрешает движение и информирует о наличии нерегулируемого перекрестка", is_correct: true },
      { text_uz: "Harakatlanishni qat'iyan taqiqlaydi", text_ru: "Категорически запрещает движение", is_correct: false },
      { text_uz: "Faqat jamoat transportiga harakatga ruxsat beradi", text_ru: "Разрешает движение только общественному транспорту", is_correct: false },
    ],
  },
  {
    topicIndex: 2,
    text_uz: "Tartibga soluvchi o'ng qo'lini yuqoriga ko'targanda qaysi transport vositalariga harakatlanishga ruxsat etiladi?",
    text_ru: "Каким транспортным средствам разрешено движение, когда регулировщик поднял правую руку вверх?",
    image_path: null,
    explanation_uz: "Tartibga soluvchi qo'lini yuqoriga ko'targanda barcha transport vositalari va piyodalarning harakatlanishi taqiqlanadi (chorrahaga kirib ulgurganlardan tashqari).",
    explanation_ru: "Когда рука регулировщика поднята вверх, движение всех транспортных средств и пешеходов запрещено во всех направлениях.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Barcha transport vositalarining harakatlanishi taqiqlanadi", text_ru: "Движение всех транспортных средств запрещено", is_correct: true },
      { text_uz: "Orqa va old tomondan kelayotganlarga ruxsat etiladi", text_ru: "Разрешено движущимся со спины и груди", is_correct: false },
      { text_uz: "Chap va o'ng yon tomondan kelayotganlarga ruxsat etiladi", text_ru: "Разрешено движущимся с правого и левого бока", is_correct: false },
    ],
  },
  {
    topicIndex: 2,
    text_uz: "Svetoforning yashil ishorasi yonib turgan bo'lsa-yu, tartibga soluvchi taqiqlovchi ishora ko'rsatsa, haydovchi qanday yo'l tutishi kerak?",
    text_ru: "Как должен поступить водитель, если горит зеленый сигнал светофора, но регулировщик подает запрещающий сигнал?",
    image_path: null,
    explanation_uz: "Tartibga soluvchining ishoralari svetofor ishoralari va imtiyoz belgilaridan ustun turadi.",
    explanation_ru: "Водители должны выполнять сигналы и распоряжения регулировщика, даже если они противоречат сигналам светофора и знакам приоритета.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Tartibga soluvchining ishorasiga bo'ysunib to'xtashi kerak", text_ru: "Подчиниться сигналу регулировщика и остановиться", is_correct: true },
      { text_uz: "Svetoforning yashil chirog'iga qarab harakatni davom ettirishi kerak", text_ru: "Продолжить движение на зеленый сигнал светофора", is_correct: false },
      { text_uz: "Ovozli signal berib chorrahadan o'tib ketishi kerak", text_ru: "Подать звуковой сигнал и проехать перекресток", is_correct: false },
    ],
  },
  {
    topicIndex: 2,
    text_uz: "Svetoforning asosiy qizil chirog'i bilan birga qo'shimcha tarmoqda yashil strelka yonsa, haydovchi nima qilishi shart?",
    text_ru: "Что обязан сделать водитель при движении в направлении зеленой стрелки в дополнительной секции одновременно с красным сигналом светофора?",
    image_path: "/seed/diagrams/intersection-1.svg",
    explanation_uz: "Asosiy qizil yoki sariq ishora bilan birga yongan qo'shimcha yashil strelka bo'yicha harakatlanayotgan haydovchi boshqa yo'nalishlardan kelayotgan transport vositalariga yo'l berishi shart.",
    explanation_ru: "При движении в направлении стрелки, включенной в дополнительной секции одновременно с красным или желтым сигналом, водитель обязан уступить дорогу ТС, движущимся с других направлений.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Boshqa yo'nalishlardan harakatlanayotgan transport vositalariga yo'l berib, strelka yo'nalishida yurishi", text_ru: "Уступить дорогу ТС с других направлений и продолжить движение по стрелке", is_correct: true },
      { text_uz: "Hech kimga yo'l bermasdan ustunlik bilan o'tishi", text_ru: "Проехать первым, пользуясь преимуществом", is_correct: false },
      { text_uz: "Asosiy yashil chiroq yonguncha kutib turishi", text_ru: "Ждать включения основного зеленого сигнала", is_correct: false },
    ],
  },
  {
    topicIndex: 2,
    text_uz: "Svetoforning qizil va sariq ishoralari bir vaqtda yonishi nimani anglatadi?",
    text_ru: "Что означает сочетание красного и желтого сигналов светофора?",
    image_path: null,
    explanation_uz: "Qizil va sariq ishoralarning birgalikda yonishi harakatlanishni taqiqlaydi va tez orada yashil ishora yonishini bildiradi.",
    explanation_ru: "Сочетание красного и желтого сигналов запрещает движение и информирует о предстоящем включении зеленого сигнала.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Harakatlanishni taqiqlaydi va yashil ishora yonishidan xabar beradi", text_ru: "Запрещает движение и информирует о предстоящем включении зеленого сигнала", is_correct: true },
      { text_uz: "Harakatni darhol boshlashga ruxsat beradi", text_ru: "Разрешает немедленно начать движение", is_correct: false },
      { text_uz: "Faqat o'ngga burilishga ruxsat beradi", text_ru: "Разрешает только поворот направо", is_correct: false },
    ],
  },

  // Topic 3: Harakatlanishni boshlash va manyovr qilish (5 questions)
  {
    topicIndex: 3,
    text_uz: "Yonma-yon bo'laklarda bir yo'nalishda harakatlanayotgan ikkita avtomobil bir vaqtda o'rin almashtirmoqchi bo'lsa, kim yo'l beradi?",
    text_ru: "Кто должен уступить дорогу при одновременном перестроении транспортных средств, движущихся попутно?",
    image_path: "/seed/diagrams/lane-change.svg",
    explanation_uz: "Bir vaqtda qayta tizilishda o'ng tomondagi transport vositasiga yo'l beriladi («o'ng qo'l qoidasi»).",
    explanation_ru: "При одновременном перестроении транспортных средств, движущихся попутно, водитель должен уступить дорогу ТС, находящемуся справа.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Chap bo'lakdagi haydovchi o'ng tomondagiga yo'l beradi", text_ru: "Водитель, находящийся слева, уступает тому, кто справа", is_correct: true },
      { text_uz: "O'ng bo'lakdagi haydovchi chap tomondagiga yo'l beradi", text_ru: "Водитель, находящийся справа, уступает тому, кто слева", is_correct: false },
      { text_uz: "Tezligi yuqori bo'lgan avtomobil birinchi o'tadi", text_ru: "Первым перестраивается тот, чья скорость выше", is_correct: false },
    ],
  },
  {
    topicIndex: 3,
    text_uz: "Qaysi joylarda qayrilib olish (razvorot) qat'iyan taqiqlanadi?",
    text_ru: "В каких местах категорически запрещается разворот?",
    image_path: null,
    explanation_uz: "Piyodalar o'tish joylarida, tunnellarda, ko'priklarda, estakadalarda, temir yo'l kesishmalarida hamda yo'lning ko'rinishi 100 metrdan kam bo'lgan joylarda qayrilib olish taqiqlanadi.",
    explanation_ru: "Разворот запрещается на пешеходных переходах, в тоннелях, на мостах, путепроводах, ж/д переездах и при видимости дороги менее 100 м.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Piyodalar o'tish joylarida, ko'priklarda, tunnellarda va temir yo'l kesishmalarida", text_ru: "На пешеходных переходах, мостах, в тоннелях и на железнодорожных переездах", is_correct: true },
      { text_uz: "Barcha tartibga solinmagan chorrahalarda", text_ru: "На всех нерегулируемых перекрестках", is_correct: false },
      { text_uz: "Ikki bo'lakli yo'llarning barcha qismlarida", text_ru: "На всех участках двухполосных дорог", is_correct: false },
    ],
  },
  {
    topicIndex: 3,
    text_uz: "Yo'l yoqasidan yoki hovli hududidan qatnov qismiga chiqayotgan haydovchi kimga yo'l berishi shart?",
    text_ru: "Кому обязан уступить дорогу водитель при выезде с прилегающей территории (двора, АЗС) на дорогу?",
    image_path: null,
    explanation_uz: "Yondosh hududdan yo'lga chiqayotgan haydovchi yo'ldan harakatlanayotgan barcha transport vositalariga va piyodalarga yo'l berishi shart.",
    explanation_ru: "При выезде на дорогу с прилегающей территории водитель должен уступить дорогу транспортным средствам и пешеходам, движущимся по ней.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Yo'lda harakatlanayotgan barcha transport vositalari va piyodalarga", text_ru: "Всем транспортным средствам и пешеходам, движущимся по дороге", is_correct: true },
      { text_uz: "Faqat o'ng tomondan kelayotgan transport vositalariga", text_ru: "Только транспортным средствам, приближающимся справа", is_correct: false },
      { text_uz: "Faqat jamoat transportiga", text_ru: "Только маршрутным транспортным средствам", is_correct: false },
    ],
  },
  {
    topicIndex: 3,
    text_uz: "Burilish ko'rsatkich chiroqlarini (povorotnik) qachon o'chirish kerak?",
    text_ru: "Когда должна быть прекращена подача сигнала указателями поворота?",
    image_path: null,
    explanation_uz: "Burilish ko'rsatkichlari manyovr tugallangandan so'ng darhol o'chirilishi kerak.",
    explanation_ru: "Подача сигнала указателями поворота должна быть прекращена немедленно после завершения маневра.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Manyovr tugagandan so'ng darhol", text_ru: "Немедленно после завершения маневра", is_correct: true },
      { text_uz: "Manyovr tugaganidan 10 soniya o'tgach", text_ru: "Через 10 секунд после завершения маневра", is_correct: false },
      { text_uz: "Chorrahadan 50 metr uzoqlashgandan keyin", text_ru: "После удаления от перекрестка на 50 метров", is_correct: false },
    ],
  },
  {
    topicIndex: 3,
    text_uz: "Orqaga harakatlanish (zadniy xod) qaysi joyda ruxsat etiladi?",
    text_ru: "В каком из перечисленных мест разрешается движение задним ходом?",
    image_path: null,
    explanation_uz: "Chorrahalarda va qayrilib olish taqiqlangan joylarda orqaga yurish taqiqlanadi; bir tomonlama harakatli yo'lda esa xavfsizlikni ta'minlagan holda ruxsat etiladi.",
    explanation_ru: "Движение задним ходом запрещено на перекрестках и в местах, где запрещен разворот; на дорогах с односторонним движением оно разрешено при обеспечении безопасности.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Bir tomonlama harakat tashkil etilgan yo'llarda (boshqalarga xalaqit bermagan holda)", text_ru: "На дорогах с односторонним движением (при отсутствии помех другим участникам)", is_correct: true },
      { text_uz: "Tartibga solinmagan chorrahalarda", text_ru: "На нерегулируемых перекрестках", is_correct: false },
      { text_uz: "Piyodalar o'tish joylarida", text_ru: "На пешеходных переходах", is_correct: false },
    ],
  },

  // Topic 4: Harakat tezligi va quvib o'tish (5 questions)
  {
    topicIndex: 4,
    text_uz: "O'zbekiston Respublikasida aholi punktlarida transport vositalarining ruxsat etilgan eng yuqori tezligi qancha (maxsus belgilar bo'lmaganda)?",
    text_ru: "Какова максимальная разрешенная скорость движения ТС в населенных пунктах Республики Узбекистан (при отсутствии иных знаков)?",
    image_path: null,
    explanation_uz: "O'zbekiston Respublikasi YHQga muvofiq aholi punktlarida transport vositalarining tezligi 60 km/soat dan oshmasligi kerak.",
    explanation_ru: "В населенных пунктах Республики Узбекистан разрешается движение транспортных средств со скоростью не более 60 км/ч.",
    ru_reviewed: true,
    answers: [
      { text_uz: "60 km/soat", text_ru: "60 км/ч", is_correct: true },
      { text_uz: "70 km/soat", text_ru: "70 км/ч", is_correct: false },
      { text_uz: "80 km/soat", text_ru: "80 км/ч", is_correct: false },
    ],
  },
  {
    topicIndex: 4,
    text_uz: "Maktab va maktabgacha ta'lim tashkilotlari atrofidagi yo'llarda (300 metrgacha masofada) ruxsat etilgan maksimal tezlik qancha?",
    text_ru: "Какова максимальная разрешенная скорость на дорогах возле школ и дошкольных образовательных учреждений (в радиусе до 300 м)?",
    image_path: "/seed/signs/1.21.svg",
    explanation_uz: "Maktab va maktabgacha ta'lim muassasalari oldidagi yo'llarda harakat tezligi 30 km/soat dan oshmasligi belgilangan.",
    explanation_ru: "На дорогах вблизи школ и дошкольных учреждений скорость движения не должна превышать 30 км/ч.",
    ru_reviewed: true,
    answers: [
      { text_uz: "30 km/soat", text_ru: "30 км/ч", is_correct: true },
      { text_uz: "40 km/soat", text_ru: "40 км/ч", is_correct: false },
      { text_uz: "50 km/soat", text_ru: "50 км/ч", is_correct: false },
    ],
  },
  {
    topicIndex: 4,
    text_uz: "Turar joy dahalarida (ichki hovlilarda) transport vositalarining eng yuqori harakat tezligi necha km/soat?",
    text_ru: "Какова максимальная скорость движения транспортных средств в жилых зонах и на дворовых территориях?",
    image_path: null,
    explanation_uz: "Turar joy dahalarida va hovli hududlarida harakat tezligi 20 km/soat dan oshmasligi shart.",
    explanation_ru: "В жилых зонах и на дворовых территориях скорость движения не должна превышать 20 км/ч.",
    ru_reviewed: true,
    answers: [
      { text_uz: "20 km/soat", text_ru: "20 км/ч", is_correct: true },
      { text_uz: "30 km/soat", text_ru: "30 км/ч", is_correct: false },
      { text_uz: "40 km/soat", text_ru: "40 км/ч", is_correct: false },
    ],
  },
  {
    topicIndex: 4,
    text_uz: "Aholi punktlaridan tashqarida yengil avtomobillarga ruxsat etilgan eng yuqori tezlik qancha?",
    text_ru: "С какой максимальной скоростью разрешено движение легковым автомобилям вне населенных пунктов на обычных дорогах?",
    image_path: null,
    explanation_uz: "Aholi punktlaridan tashqarida yengil avtomobillarga 100 km/soat gacha tezlikda harakatlanishga ruxsat etiladi.",
    explanation_ru: "Вне населенных пунктов легковым автомобилям разрешается движение со скоростью не более 100 км/ч.",
    ru_reviewed: true,
    answers: [
      { text_uz: "100 km/soat", text_ru: "100 км/ч", is_correct: true },
      { text_uz: "90 km/soat", text_ru: "90 км/ч", is_correct: false },
      { text_uz: "120 km/soat", text_ru: "120 км/ч", is_correct: false },
    ],
  },
  {
    topicIndex: 4,
    text_uz: "Temir yo'l kesishmasida va unga necha metr qolganda quvib o'tish taqiqlanadi?",
    text_ru: "На каком расстоянии перед железнодорожным переездом запрещается обгон?",
    image_path: "/seed/signs/1.1.svg",
    explanation_uz: "Temir yo'l kesishmalarida va ularga 100 metrdan kam masofa qolganda quvib o'tish taqiqlanadi.",
    explanation_ru: "Обгон запрещен на железнодорожных переездах и ближе чем за 100 метров перед ними.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Kesishmada va unga 100 metrdan kam masofa qolganda", text_ru: "На переезде и ближе чем за 100 м перед ним", is_correct: true },
      { text_uz: "Kesishmada va unga 50 metrdan kam masofa qolganda", text_ru: "На переезде и ближе чем за 50 м перед ним", is_correct: false },
      { text_uz: "Kesishmadan keyin 100 metr masofada", text_ru: "В течение 100 м после переезда", is_correct: false },
    ],
  },

  // Topic 5: Chorrahalarda harakatlanish (5 questions - some unreviewed for translation queue!)
  {
    topicIndex: 5,
    text_uz: "Teng ahamiyatli yo'llar kesishgan chorrahada (imtiyoz belgilari bo'lmaganda) relssiz transport vositalari haydovchilari kimga yo'l berishi shart?",
    text_ru: "Кому обязаны уступить дорогу водители безрельсовых ТС на перекрестке равнозначных дорог?",
    image_path: "/seed/diagrams/equal-crossroad.svg",
    explanation_uz: "Teng ahamiyatli yo'llar chorrahasida haydovchi o'ziga o'ng tomondan yaqinlashib kelayotgan transport vositasiga yo'l berishi shart.",
    explanation_ru: "На перекрестке равнозначных дорог водитель безрельсового ТС обязан уступить дорогу транспортным средствам, приближающимся справа.",
    ru_reviewed: false,
    answers: [
      { text_uz: "O'ng tomondan yaqinlashib kelayotgan transport vositalariga", text_ru: "Транспортным средствам, приближающимся справа", is_correct: true },
      { text_uz: "Chap tomondan yaqinlashib kelayotgan transport vositalariga", text_ru: "Транспортным средствам, приближающимся слева", is_correct: false },
      { text_uz: "Kattaroq o'lchamdagi avtomobillarga", text_ru: "Более крупногабаритным автомобилям", is_correct: false },
    ],
  },
  {
    topicIndex: 5,
    text_uz: "Chorrahada o'ngga yoki chapga burilayotgan haydovchi qatnov qismidan o'tayotgan piyodalarga yo'l berishi shartmi?",
    text_ru: "Обязан ли водитель при повороте направо или налево на перекрестке уступить дорогу пешеходам, переходящим проезжую часть, на которую он поворачивает?",
    image_path: null,
    explanation_uz: "O'ngga yoki chapga burilayotgan haydovchi o'zi burilayotgan qatnov qismidan kesib o'tayotgan piyodalar va velosipedchilarga yo'l berishi shart.",
    explanation_ru: "При повороте направо или налево водитель обязан уступить дорогу пешеходам и велосипедистам, пересекающим проезжую часть дороги, на которую он поворачивает.",
    ru_reviewed: false,
    answers: [
      { text_uz: "Ha, har qanday holatda yo'l berishi shart", text_ru: "Да, обязан уступить в любом случае", is_correct: true },
      { text_uz: "Faqat tartibga solinmagan chorrahada yo'l beradi", text_ru: "Обязан только на нерегулируемом перекрестке", is_correct: false },
      { text_uz: "Yo'q, burilayotgan avtomobil ustunlikka ega", text_ru: "Нет, поворачивающий автомобиль имеет преимущество", is_correct: false },
    ],
  },
  {
    topicIndex: 5,
    text_uz: "Yashil chiroqda chapga burilayotgan yoki qayrilayotgan haydovchi qarama-qarshi tomondan to'g'riga yoki o'ngga ketayotgan transportga yo'l beradimi?",
    text_ru: "Обязан ли водитель при повороте налево или развороте по зеленому сигналу светофора уступить дорогу встречным ТС, движущимся прямо или направо?",
    image_path: "/seed/diagrams/left-turn.svg",
    explanation_uz: "Svetoforning ruxsat etuvchi ishorasida chapga burilayotgan yoki qayrilib olayotgan haydovchi ro'paradan to'g'riga yoki o'ngga harakatlanayotgan transport vositalariga yo'l berishi shart.",
    explanation_ru: "При повороте налево или развороте по зеленому сигналу светофора водитель обязан уступить дорогу транспортным средствам, движущимся со встречного направления прямо или направо.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Ha, ro'paradan to'g'riga va o'ngga ketayotganlarga yo'l berishi shart", text_ru: "Да, обязан уступить встречным ТС, движущимся прямо или направо", is_correct: true },
      { text_uz: "Yo'q, chapga burilayotgan haydovchi birinchi o'tadi", text_ru: "Нет, поворачивающий налево проезжает первым", is_correct: false },
      { text_uz: "Faqat yuk avtomobillariga yo'l beradi", text_ru: "Уступает только грузовым автомобилям", is_correct: false },
    ],
  },
  {
    topicIndex: 5,
    text_uz: "Agar chorrahadan keyin tirbandlik (probka) yuzaga kelib, haydovchini chorraha ichida to'xtashga majbur qiladigan bo'lsa, chorrahaga kirish mumkinmi?",
    text_ru: "Разрешается ли выезжать на перекресток, если за ним образовался затор, который вынудит водителя остановиться на пересечении проезжих частей?",
    image_path: null,
    explanation_uz: "Ko'ndalang yo'nalishdagi transport vositalarining harakatiga to'sqinlik yaratadigan tirbandlik yuzaga kelgan bo'lsa, chorrahaga kirish taqiqlanadi (burilish hollari bundan mustasno).",
    explanation_ru: "Запрещается выезжать на перекресток или пересечение проезжих частей, если образовался затор, который вынудит водителя остановиться, создав препятствие для движения ТС в поперечном направлении.",
    ru_reviewed: true,
    answers: [
      { text_uz: "To'g'riga o'tish uchun kirish taqiqlanadi (ko'ndalang harakatga xalaqit bersa)", text_ru: "Запрещается для движения прямо, если это создаст помеху поперечному движению", is_correct: true },
      { text_uz: "Yashil chiroq yoniq bo'lsa bemalol kirish mumkin", text_ru: "Разрешается в любом случае, если горит зеленый сигнал", is_correct: false },
      { text_uz: "Faqat asosiy yo'lda bo'lganda kirish mumkin", text_ru: "Разрешается только при движении по главной дороге", is_correct: false },
    ],
  },
  {
    topicIndex: 5,
    text_uz: "Teng ahamiyatli yo'llarda tramvay va yengil avtomobil kesishib qolsa, qaysi biri ustunlikka ega?",
    text_ru: "Кто имеет преимущество на перекрестке равнозначных дорог — трамвай или легковой автомобиль?",
    image_path: null,
    explanation_uz: "Teng ahamiyatli yo'llar chorrahasida tramvay harakat yo'nalishidan qat'i nazar relssiz transport vositalariga nisbatan ustunlikka ega.",
    explanation_ru: "На перекрестке равнозначных дорог трамвай имеет преимущество перед безрельсовыми транспортными средствами независимо от направления его движения.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Tramvay harakat yo'nalishidan qat'i nazar ustunlikka ega", text_ru: "Трамвай имеет преимущество независимо от направления его движения", is_correct: true },
      { text_uz: "O'ng tomondan kelayotgan yengil avtomobil", text_ru: "Легковой автомобиль, если он приближается справа", is_correct: false },
      { text_uz: "To'g'riga harakatlanayotgan yengil avtomobil", text_ru: "Легковой автомобиль, движущийся прямо", is_correct: false },
    ],
  },

  // Topic 6: To'xtash va to'xtab turish qoidalari (5 questions)
  {
    topicIndex: 6,
    text_uz: "Piyodalar o'tish joyiga necha metrdan kam masofada transport vositalarining to'xtashi taqiqlanadi?",
    text_ru: "На каком расстоянии перед пешеходным переходом запрещается остановка транспортных средств?",
    image_path: "/seed/signs/5.16.1.svg",
    explanation_uz: "Piyodalar o'tish joylarida va ulardan oldin 5 metrdan kam masofada to'xtash taqiqlanadi.",
    explanation_ru: "Остановка запрещается на пешеходных переходах и ближе 5 метров перед ними.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Piyodalar o'tish joyida va undan oldin 5 metrdan kam masofada", text_ru: "На пешеходном переходе и ближе 5 метров перед ним", is_correct: true },
      { text_uz: "Piyodalar o'tish joyidan oldin va keyin 10 metr masofada", text_ru: "За 10 метров до и после пешеходного перехода", is_correct: false },
      { text_uz: "15 metrdan kam masofada", text_ru: "Ближе 15 метров", is_correct: false },
    ],
  },
  {
    topicIndex: 6,
    text_uz: "Yo'nalishli transport vositalari (avtobus) bekatlariga necha metrdan yaqin masofada to'xtash taqiqlanadi (yo'lovchi tushirish/chiqarishdan tashqari)?",
    text_ru: "Ближе какого расстояния от указателя остановки маршрутных ТС запрещается остановка (если она создает помехи маршрутным ТС)?",
    image_path: null,
    explanation_uz: "Bekat ko'rsatkichidan 15 metrdan kam masofada (yo'nalishli transport vositalariga xalaqit bersa) to'xtash va to'xtab turish taqiqlanadi.",
    explanation_ru: "Запрещается остановка и стоянка ближе 15 метров от указателей остановок маршрутных транспортных средств.",
    ru_reviewed: true,
    answers: [
      { text_uz: "15 metrdan kam masofada", text_ru: "Ближе 15 метров", is_correct: true },
      { text_uz: "5 metrdan kam masofada", text_ru: "Ближе 5 метров", is_correct: false },
      { text_uz: "30 metrdan kam masofada", text_ru: "Ближе 30 метров", is_correct: false },
    ],
  },
  {
    topicIndex: 6,
    text_uz: "Qatnov qismlari kesishmasiga (chorrahaga) necha metrdan yaqin masofada to'xtash taqiqlanadi?",
    text_ru: "Ближе какого расстояния от края пересекаемой проезжей части запрещается остановка?",
    image_path: null,
    explanation_uz: "Kesishayotgan qatnov qismi chetidan 5 metrdan kam masofada to'xtash taqiqlanadi.",
    explanation_ru: "Остановка запрещается на пересечении проезжих частей и ближе 5 метров от края пересекаемой проезжей части.",
    ru_reviewed: true,
    answers: [
      { text_uz: "5 metrdan kam masofada", text_ru: "Ближе 5 метров", is_correct: true },
      { text_uz: "10 metrdan kam masofada", text_ru: "Ближе 10 метров", is_correct: false },
      { text_uz: "20 metrdan kam masofada", text_ru: "Ближе 20 метров", is_correct: false },
    ],
  },
  {
    topicIndex: 6,
    text_uz: "3.28 «To'xtab turish taqiqlangan» belgisi ta'sir hududida yo'lovchini tushirish uchun qisqa muddatga to'xtash mumkinmi?",
    text_ru: "Разрешается ли кратковременная остановка для посадки или высадки пассажира в зоне действия знака 3.28 «Стоянка запрещена»?",
    image_path: "/seed/signs/3.28.svg",
    explanation_uz: "3.28 belgisi faqat to'xtab turishni (stoyanka) taqiqlaydi, to'xtashni (ostanovka) esa taqiqlamaydi.",
    explanation_ru: "Знак 3.28 запрещает только стоянку, но не запрещает остановку для посадки/высадки пассажиров или загрузки/разгрузки груза.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Ha, to'xtashga ruxsat etiladi", text_ru: "Да, остановка разрешается", is_correct: true },
      { text_uz: "Yo'q, har qanday to'xtash taqiqlanadi", text_ru: "Нет, любая остановка запрещена", is_correct: false },
      { text_uz: "Faqat taksilarga ruxsat etiladi", text_ru: "Разрешается только легковым такси", is_correct: false },
    ],
  },
  {
    topicIndex: 6,
    text_uz: "Aholi punktlarida majburiy to'xtaganda «Avariya sababli to'xtash belgisi» transport vositasidan kamida necha metr masofada o'rnatiladi?",
    text_ru: "На каком минимальном расстоянии от транспортного средства должен быть выставлен знак аварийной остановки в населенном пункте?",
    image_path: null,
    explanation_uz: "Avariya sababli to'xtash belgisi aholi punktlarida transport vositasidan kamida 15 metr, aholi punktlaridan tashqarida esa kamida 30 metr masofada o'rnatiladi.",
    explanation_ru: "Знак аварийной остановки устанавливается на расстоянии не менее 15 м от ТС в населенных пунктах и не менее 30 м — вне населенных пунктов.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Kamida 15 metr (aholi punktidan tashqarida 30 metr)", text_ru: "Не менее 15 метров (вне населенных пунктов — 30 метров)", is_correct: true },
      { text_uz: "Kamida 5 metr", text_ru: "Не менее 5 метров", is_correct: false },
      { text_uz: "Kamida 50 metr", text_ru: "Не менее 50 метров", is_correct: false },
    ],
  },

  // Topic 7: Texnik holat va birinchi tibbiy yordam (5 questions)
  {
    topicIndex: 7,
    text_uz: "Yengil avtomobil shinalari protektorining qoldiq balandligi kamida qancha bo'lishi kerak?",
    text_ru: "Какова минимально допустимая остаточная высота рисунка протектора шин легкового автомобиля?",
    image_path: null,
    explanation_uz: "Yengil avtomobillar («B» toifa) shinalari protektori naqshlarining qoldiq balandligi kamida 1,6 mm bo'lishi shart.",
    explanation_ru: "Для легковых автомобилей остаточная высота рисунка протектора шин должна составлять не менее 1,6 мм.",
    ru_reviewed: false,
    answers: [
      { text_uz: "1,6 mm", text_ru: "1,6 мм", is_correct: true },
      { text_uz: "0,8 mm", text_ru: "0,8 мм", is_correct: false },
      { text_uz: "2,5 mm", text_ru: "2,5 мм", is_correct: false },
    ],
  },
  {
    topicIndex: 7,
    text_uz: "Qaysi nosozlik mavjud bo'lganda transport vositasidan foydalanish va harakatni davom ettirish qat'iyan taqiqlanadi?",
    text_ru: "При какой неисправности категорически запрещается дальнейшее движение транспортного средства?",
    image_path: null,
    explanation_uz: "Ishchi tormoz tizimi yoki rul boshqaruvi ishlamay qolganda transport vositasining harakatlanishi qat'iyan taqiqlanadi.",
    explanation_ru: "Дальнейшее движение запрещено при неисправности рабочей тормозной системы или рулевого управления.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Ishchi tormoz tizimi yoki rul boshqaruvi ishlamasa", text_ru: "Не действуют рабочая тормозная система или рулевое управление", is_correct: true },
      { text_uz: "Orqa oynani isitish moslamasi ishlamasa", text_ru: "Не работает обогрев заднего стекла", is_correct: false },
      { text_uz: "Salon chirog'i yonmasa", text_ru: "Не горит плафон освещения салона", is_correct: false },
    ],
  },
  {
    topicIndex: 7,
    text_uz: "Egzoz chiqindilari yoki yoqilg'i tizimidagi qaysi holat transport vositasidan foydalanishni taqiqlaydi?",
    text_ru: "Какая неисправность топливной системы запрещает эксплуатацию автомобиля?",
    image_path: null,
    explanation_uz: "Yoqilg'i tizimining germetikligi buzilgan (yoqilg'i tomchilab oqayotgan) bo'lsa, yong'in xavfi tufayli foydalanish taqiqlanadi.",
    explanation_ru: "При нарушении герметичности системы питания (подтекании топлива) эксплуатация ТС запрещена из-за опасности возгорания.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Yoqilg'i tizimining germetikligi buzilib yoqilg'i oqayotgan bo'lsa", text_ru: "Нарушена герметичность системы питания (подтекание топлива)", is_correct: true },
      { text_uz: "Yoqilg'i bakida benzin kam qolgan bo'lsa", text_ru: "Низкий уровень топлива в баке", is_correct: false },
      { text_uz: "Yoqilg'i ko'rsatkichi chirog'i yonsa", text_ru: "Загорелся индикатор резерва топлива", is_correct: false },
    ],
  },
  {
    topicIndex: 7,
    text_uz: "Arterial qon ketishining asosiy belgisi va birinchi yordam usuli qanday?",
    text_ru: "Каков основной признак артериального кровотечения и способ оказания первой помощи?",
    image_path: null,
    explanation_uz: "Arterial qon ketishda qon och qizil rangda va puls bilan otilib chiqadi; jarohatdan yuqoriroq joyga (yurakka yaqinroq) jgut qo'yiladi va qo'yilgan vaqti yozib qo'yiladi.",
    explanation_ru: "При артериальном кровотечении кровь алого цвета бьет пульсирующей струей; необходимо наложить жгут выше места ранения с указанием времени наложения.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Och qizil qon puls bilan otilib chiqadi; jarohatdan yuqoriga jgut boylanadi va vaqti yoziladi", text_ru: "Алая кровь бьет струей; накладывается жгут выше раны с запиской о времени", is_correct: true },
      { text_uz: "To'q qizil qon sekin oqadi; jarohat ustiga yod surtiladi", text_ru: "Темная кровь вытекает медленно; рана смазывается йодом", is_correct: false },
      { text_uz: "Jarohatdan pastroqqa bog'lam qo'yiladi", text_ru: "Повязка накладывается ниже места ранения", is_correct: false },
    ],
  },
  {
    topicIndex: 7,
    text_uz: "YTHda jabrlanuvchining umurtqa pog'onasi shikastlanganlik ehtimoli bo'lsa, uni qanday holatda yotqizish va tashish kerak?",
    text_ru: "Как следует укладывать и транспортировать пострадавшего при подозрении на травму позвоночника?",
    image_path: null,
    explanation_uz: "Umurtqa pog'onasi shikastlanganda jabrlanuvchini faqat qattiq va tekis yuzaga (taxta, qalqon) chalqancha yotqizish kerak, o'tqazish qat'iyan man etiladi.",
    explanation_ru: "При подозрении на травму позвоночника пострадавшего укладывают на спину только на твердую ровную поверхность (щит, доски); сажать категорически запрещено.",
    ru_reviewed: true,
    answers: [
      { text_uz: "Faqat qattiq va tekis yuzaga (qalqon, taxta) chalqancha yotqizgan holda", text_ru: "Только лежа на спине на твердой ровной поверхности (щите)", is_correct: true },
      { text_uz: "Avtomobilning orqa o'rindig'iga yarim o'tirgan holatda", text_ru: "В полусидячем положении на заднем сиденье автомобиля", is_correct: false },
      { text_uz: "Yumshoq ko'rpacha ustiga yonboshlatib", text_ru: "На боку на мягком одеяле", is_correct: false },
    ],
  },
];

export const SEED_CHAPTERS = [
  {
    sort: 1,
    topicIndex: 0,
    title_uz: "1-bob. Umumiy qoidalar va haydovchining majburiyatlari",
    title_ru: "Глава 1. Общие положения и обязанности водителей",
    body_uz: `### Yo'l harakati qoidalarining maqsadi

O'zbekiston Respublikasining Yo'l harakati qoidalari (YHQ) respublika hududidagi barcha yo'llarda harakatlanishning yagona tartibini belgilaydi.

#### Asosiy tushunchalar
- **Asosiy yo'l** — tuproqli yo'lga nisbatan qattiq qoplamali (asfalt, sement-beton) yo'l yoki 2.1 «Asosiy yo'l» belgisi bilan belgilangan yo'l.
- **Yetarlicha ko'rinmaslik** — yomg'ir, qor yog'ishi, tuman tushishi va g'ira-shira paytida yo'lning ko'rinishi **300 metrdan** kam bo'lishi.
- **Quvib o'tish** — egallagan harakatlanish bo'lagidan chiqib, oldinda harakatlanayotgan bir yoki bir nechta transport vositasidan o'zib ketish.

#### Haydovchining asosiy majburiyatlari
1. Haydovchilik guvohnomasi va ro'yxatdan o'tkazish hujjatlari yonida bo'lishi shart.
2. Harakatni boshlashdan oldin transport vositasining texnik sozligini tekshirishi kerak.
3. Harakat vaqtida **xavfsizlik kamarini** taqishi va yo'lovchilarning ham taqqanligini nazorat qilishi shart.
4. Boshqaruv vaqtida **telefondan foydalanish qat'iyan taqiqlanadi**.`,
    body_ru: `### Назначение Правил дорожного движения

Правила дорожного движения Республики Узбекистан устанавливают единый порядок дорожного движения на всей территории страны.

#### Основные понятия
- **Главная дорога** — дорога с твердым покрытием по отношению к грунтовой, либо дорога, обозначенная знаком 2.1 «Главная дорога».
- **Недостаточная видимость** — видимость дороги менее **300 метров** в условиях тумана, дождя, снегопада, а также в сумерки.
- **Обгон** — опережение одного или нескольких движущихся ТС, связанное с выездом из занимаемой полосы.

#### Основные обязанности водителя
1. Иметь при себе водительское удостоверение и регистрационные документы.
2. Перед выездом проверить техническую исправность транспортного средства.
3. Во время движения быть пристегнутым **ремнем безопасности** и контролировать пристегивание пассажиров.
4. Во время движения **пользоваться телефоном категорически запрещено**.`,
    ru_reviewed: true,
  },
  {
    sort: 2,
    topicIndex: 1,
    title_uz: "2-bob. Yo'l belgilari guruhlari va ularning ahamiyati",
    title_ru: "Глава 2. Группы дорожных знаков и их значение",
    body_uz: `### Yo'l belgilari tasnifi

Yo'l belgilari vazifasiga ko'ra quyidagi guruhlarga bo'linadi:

1. **Ogohlantiruvchi belgilar (1-guruh)** — qizil hoshiyali oq uchburchak shaklida bo'lib, yo'lning xavfli qismiga yaqinlashayotganlik haqida ogohlantiradi (aholi punktlarida 50–100 m, tashqarida 150–300 m oldin o'rnatiladi).
2. **Imtiyoz belgilari (2-guruh)** — chorrahalar, qatnov qismlari kesishmalari yoki yo'lning tor qismlaridan o'tish navbatini belgilaydi.
3. **Taqiqlovchi belgilar (3-guruh)** — harakatlanishga ma'lum cheklovlar kiritadi yoki ularni bekor qiladi.
4. **Buyuruvchi belgilar (4-guruh)** — ko'k doira shaklida bo'lib, ruxsat etilgan harakat yo'nalishlarini ko'rsatadi.
5. **Axborot-ishora va servis belgilari (5–6-guruhlar)** — harakat rejimlari va xizmat ko'rsatish obyektlari haqida ma'lumot beradi.

> **Muhim qoida:** Vaqtinchalik yo'l belgilari doimiy yo'l belgilariga va yo'l chiziqlariga zid kelsa, haydovchilar **vaqtinchalik belgilarga** amal qilishlari shart.`,
    body_ru: `### Классификация дорожных знаков

Дорожные знаки делятся на следующие основные группы:

1. **Предупреждающие знаки (группа 1)** — треугольные с красной каймой, информируют о приближении к опасному участку (устанавливаются за 50–100 м в населенных пунктах и за 150–300 м вне их).
2. **Знаки приоритета (группа 2)** — устанавливают очередность проезда перекрестков или узких участков дорог.
3. **Запрещающие знаки (группа 3)** — вводят или отменяют определенные ограничения движения.
4. **Предписывающие знаки (группа 4)** — круглые синие знаки, указывают обязательные направления движения.
5. **Информационно-указательные и знаки сервиса (группы 5–6)** — информируют о режимах движения и объектах сервиса.

> **Важное правило:** Если временные дорожные знаки противоречат постоянным знакам или разметке, водители обязаны руководствоваться **временными знаками**.`,
    ru_reviewed: true,
  },
  {
    sort: 3,
    topicIndex: 2,
    title_uz: "3-bob. Svetofor va tartibga soluvchining ishoralari",
    title_ru: "Глава 3. Сигналы светофора и регулировщика",
    body_uz: `### Svetofor ishoralari

- **Yashil ishora** — harakatlanishga ruxsat beradi.
- **Yashil miltillovchi ishora** — ruxsat beradi va tez orada taqiqlovchi ishora yonishini bildiradi.
- **Sariq ishora** — harakatni taqiqlaydi (to'xtash chizig'iga keskin tormoz bermasdan to'xtay olmaydigan haydovchilar bundan mustasno).
- **Sariq miltillovchi ishora** — harakatga ruxsat beradi va chorraha tartibga solinmaganligini bildiradi.
- **Qizil ishora** — harakatlanishni qat'iyan taqiqlaydi.

### Tartibga soluvchining ishoralari

- **Qo'l yuqoriga ko'tarilgan:** Barcha transport vositalari va piyodalarning harakati taqiqlanadi.
- **Qo'llar yon tomonga uzatilgan yoki tushirilgan:**
  - Chap va o'ng yon tomondan kelayotgan relssiz transport vositalari **to'g'riga va o'ngga** yurishi mumkin.
  - Ko'krak va orqa tomondan kelayotgan barcha transport vositalarining harakati **taqiqlanadi**.`,
    body_ru: `### Сигналы светофора

- **Зеленый сигнал** — разрешает движение.
- **Зеленый мигающий сигнал** — разрешает движение и информирует, что время его действия истекает.
- **Желтый сигнал** — запрещает движение.
- **Желтый мигающий сигнал** — разрешает движение и информирует о наличии нерегулируемого перекрестка.
- **Красный сигнал** — запрещает движение.

### Сигналы регулировщика

- **Рука поднята вверх:** Движение всех транспортных средств и пешеходов запрещено во всех направлениях.
- **Руки вытянуты в стороны или опущены:**
  - Со стороны левого и правого бока безрельсовым ТС разрешено движение **прямо и направо**.
  - Со стороны груди и спины движение всех ТС **запрещено**.`,
    ru_reviewed: true,
  },
  {
    sort: 4,
    topicIndex: 4,
    title_uz: "4-bob. Harakat tezligi va quvib o'tish qoidalari",
    title_ru: "Глава 4. Скорость движения и правила обгона",
    body_uz: `### Tezlik cheklovlari (O'zbekiston YHQ)

1. **Aholi punktlarida:** barcha transport vositalari uchun — **60 km/soat** gacha.
2. **Maktab va bog'chalar yaqinida (300 m gacha):** — **30 km/soat** gacha.
3. **Turar joy dahalarida va hovlilarda:** — **20 km/soat** gacha.
4. **Aholi punktlaridan tashqarida:**
   - Yengil avtomobillar uchun — **100 km/soat** gacha.
   - Shaharlararo avtobuslar uchun — **90 km/soat** gacha.
   - Yuk avtomobillari (3,5 tonnadan ortiq) uchun — **70 km/soat** gacha.

### Quvib o'tish taqiqlangan joylar
- Tartibga solingan chorrahalarda;
- Piyodalar o'tish joylarida;
- Temir yo'l kesishmalarida va ularga **100 metrdan** kam masofa qolganda;
- Ko'priklar, estakadalar, ularning ostida va tunnellarda;
- Tepalik oxirida va ko'rinishi cheklangan xavfli burilishlarda.`,
    body_ru: `### Ограничения скорости (ПДД РУз)

1. **В населенных пунктах:** для всех ТС — не более **60 км/ч**.
2. **Возле школ и дошкольных учреждений (до 300 м):** — не более **30 км/ч**.
3. **В жилых зонах и на дворовых территориях:** — не более **20 км/ч**.
4. **Вне населенных пунктов:**
   - Легковым автомобилям — не более **100 км/ч**.
   - Междугородним автобусам — не более **90 км/ч**.
   - Грузовым автомобилям (свыше 3,5 т) — не более **70 км/ч**.

### Где обгон запрещен
- На регулируемых перекрестках;
- На пешеходных переходах;
- На железнодорожных переездах и ближе чем за **100 метров** перед ними;
- На мостах, путепроводах, эстакадах и под ними, а также в тоннелях;
- В конце подъема и на участках с ограниченной видимостью.`,
    ru_reviewed: true,
  },
  {
    sort: 5,
    topicIndex: 5,
    title_uz: "5-bob. Chorrahalarda harakatlanish qoidalari",
    title_ru: "Глава 5. Правила проезда перекрестков",
    body_uz: `### Umumiy chorraha qoidalari

1. O'ngga yoki chapga burilayotgan haydovchi o'zi burilayotgan qatnov qismidan o'tayotgan **piyodalar va velosipedchilarga** yo'l berishi shart.
2. Chorrahadan keyin tirbandlik yuzaga kelib, ko'ndalang harakatga to'sqinlik qiladigan bo'lsa, chorrahaga kirish **taqiqlanadi**.

### Tartibga solinmagan chorrahalar
- **Noteng ahamiyatli yo'llar:** Ikkinchi darajali yo'ldagi haydovchi asosiy yo'ldan kelayotgan transport vositalariga yo'l berishi shart.
- **Teng ahamiyatli yo'llar:** Relssiz transport vositasi haydovchisi **o'ng tomondan** yaqinlashib kelayotgan transport vositasiga yo'l beradi («o'ng qo'l qoidasi»).
- **Tramvay ustunligi:** Teng ahamiyatli yo'llarda tramvay har doim relssiz transport vositalariga nisbatan ustunlikka ega.`,
    body_ru: `### Общие правила проезда перекрестков

1. При повороте направо или налево водитель обязан уступить дорогу **пешеходам и велосипедистам**, пересекающим проезжую часть дороги, на которую он поворачивает.
2. Запрещается выезжать на перекресток, если образовался затор, который вынудит водителя остановиться и создать помеху поперечному движению.

### Нерегулируемые перекрестки
- **Неравнозначные дороги:** Водитель на второстепенной дороге обязан уступить ТС, приближающимся по главной.
- **Равнозначные дороги:** Водитель безрельсового ТС обязан уступить дорогу транспортным средствам, приближающимся **справа** («правило помехи справа»).
- **Преимущество трамвая:** На равнозначных дорогах трамвай всегда имеет преимущество перед безрельсовыми ТС.`,
    ru_reviewed: false,
  },
];

export const SEED_VIDEOS = [
  {
    chapterSort: 1,
    title_uz: "YHQ 1-dars: Umumiy qoidalar va atamalar",
    title_ru: "Урок 1 ПДД: Общие положения и термины",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ru_reviewed: true,
  },
  {
    chapterSort: 2,
    title_uz: "YHQ 2-dars: Yo'l belgilari va ularning turlari",
    title_ru: "Урок 2 ПДД: Дорожные знаки и их группы",
    youtube_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    ru_reviewed: true,
  },
  {
    chapterSort: 5,
    title_uz: "YHQ 5-dars: Chorrahalardan o'tish tartibi",
    title_ru: "Урок 5 ПДД: Порядок проезда перекрестков",
    youtube_url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    ru_reviewed: false,
  },
];

# Savollarni JSON formatda yuklash (`import:questions`)

Avtomaktab platformasiga savollarni CLI skript orqali yoki Admin paneldagi JSON yuklash oynasi orqali kiritish mumkin.

## 1. CLI orqali ishga tushirish

```bash
npm run import:questions -- docs/sample-import.json
```

## 2. HTTP Endpoint orqali (Admin sessiyasi bilan)

- **URL:** `POST /api/admin/import-questions`
- **Content-Type:** `application/json`

## 3. JSON fayl formati

Fayl savollar massividan (`[...]`) yoki `{ "questions": [...] }` obyektidan iborat bo'lishi mumkin.

### Maydonlar tavsifi:
- `topic_id` *(ixtiyoriy, number)* — Mavjud mavzu ID raqami.
- `topic_name_uz` *(ixtiyoriy, string)* — Mavzu nomi (agar bunday mavzu bazada bo'lmasa, avtomatik yaratiladi).
- `topic_name_ru` *(ixtiyoriy, string)* — Mavzuning rus tilidagi nomi.
- `text_uz` *(majburiy, string)* — Savolning o'zbek (lotin) tilidagi matni.
- `text_ru` *(ixtiyoriy, string)* — Savolning rus tilidagi matni (bo'sh bo'lsa `text_uz` ko'rsatiladi).
- `image_path` *(ixtiyoriy, string | null)* — Rasm manzili (masalan, `"/uploads/rasm.png"` yoki `"/seed/signs/2.1.svg"`).
- `explanation_uz` *(ixtiyoriy, string)* — To'g'ri javob izohi (O'zbek tilida).
- `explanation_ru` *(ixtiyoriy, string)* — To'g'ri javob izohi (Rus tilida).
- `ru_reviewed` *(ixtiyoriy, boolean, default: `false`)* — Ruscha tarjima tekshirilganligi.
- `status` *(ixtiyoriy, `"draft" | "published"`, default: `"published"`)* — Savol holati.
- `answers` *(majburiy, massiv: 2 tadan 5 tagacha)* — Javob variantlari. **Aynan bitta** javobda `is_correct: true` bo'lishi shart:
  - `text_uz` *(majburiy, string)*
  - `text_ru` *(ixtiyoriy, string)*
  - `is_correct` *(majburiy, boolean)*

### Namuna (`docs/sample-import.json`):

```json
{
  "questions": [
    {
      "topic_name_uz": "Umumiy qoidalar va haydovchi majburiyatlari",
      "topic_name_ru": "Общие положения и обязанности водителей",
      "text_uz": "Sutkaning qorong'i vaqtida dvigatel ishlamay qolganda qaysi chiroq yoqilishi shart?",
      "text_ru": "Какой сигнал должен быть включен при вынужденной остановке в темное время суток?",
      "image_path": null,
      "explanation_uz": "Majburiy to'xtaganda avariya ishorasi yoqilishi shart.",
      "explanation_ru": "При вынужденной остановке должна быть включена аварийная сигнализация.",
      "ru_reviewed": true,
      "status": "published",
      "answers": [
        {
          "text_uz": "Avariya yorug'lik ishorasi",
          "text_ru": "Аварийная световая сигнализация",
          "is_correct": true
        },
        {
          "text_uz": "Faqat salon chirog'i",
          "text_ru": "Только освещение салона",
          "is_correct": false
        }
      ]
    }
  ]
}
```

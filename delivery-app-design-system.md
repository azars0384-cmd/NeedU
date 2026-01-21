# Delivery App Design System
## ระบบออกแบบสำหรับแอปเดลิเวอรี่ครบวงจร

---

## 🎯 Design Philosophy

### Core Principles
- **Trust & Reliability**: สร้างความเชื่อมั่นในทุกการสั่งซื้อ
- **Speed & Efficiency**: ออกแบบเพื่อความรวดเร็วในการใช้งาน
- **Accessibility First**: รองรับผู้ใช้ทุกกลุ่ม รวมถึงผู้สูงอายุและผู้พิการ
- **Multi-Role Harmony**: ออกแบบให้สอดคล้องกันทั้ง 4 บทบาท

---

## 🎨 Color Palette

### Primary Colors
- **Primary Green**: #22C55E (Success, Complete, Positive actions)
- **Secondary Orange**: #F97316 (Warning, Pending, Highlight)
- **Accent Blue**: #3B82F6 (Info, Links, Secondary actions)

### Neutral Colors
- **Charcoal**: #1F2937 (Primary text, headings)
- **Slate**: #64748B (Secondary text, descriptions)
- **Light Gray**: #F8FAFC (Background, cards)
- **White**: #FFFFFF (Main background)

### Semantic Colors
- **Success**: #10B981 (Order confirmed, delivered)
- **Warning**: #F59E0B (Pending, processing)
- **Error**: #EF4444 (Failed, cancel, errors)
- **Info**: #06B6D4 (Information, tips)

---

## 🔤 Typography System

### Font Families
- **Primary**: 'Inter', sans-serif (UI elements, buttons, navigation)
- **Display**: 'Prompt', sans-serif (Headings, titles - รองรับภาษาไทย)
- **Body**: 'Inter', sans-serif (Body text, descriptions)

### Font Sizes (Mobile First)
- **Hero**: 32px / 2rem (App title, main heading)
- **H1**: 24px / 1.5rem (Page titles)
- **H2**: 20px / 1.25rem (Section headers)
- **H3**: 18px / 1.125rem (Subsections)
- **Body**: 16px / 1rem (Main content)
- **Small**: 14px / 0.875rem (Captions, metadata)
- **Tiny**: 12px / 0.75rem (Labels, fine print)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## 🎯 Spacing System

### Base Unit: 4px
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

---

## 🧩 Component Library

### Buttons
#### Primary Button
- Background: Primary Green (#22C55E)
- Text: White
- Padding: 16px 24px
- Border-radius: 12px
- Font-weight: 600

#### Secondary Button
- Background: White
- Border: 2px solid #22C55E
- Text: #22C55E
- Padding: 14px 22px
- Border-radius: 12px

#### Danger Button
- Background: Error (#EF4444)
- Text: White
- Padding: 16px 24px
- Border-radius: 12px

### Cards
- Background: White
- Border-radius: 16px
- Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Padding: 24px
- Border: 1px solid #E5E7EB

### Input Fields
- Background: #F8FAFC
- Border: 1px solid #D1D5DB
- Border-radius: 12px
- Padding: 16px
- Focus border: #22C55E
- Placeholder color: #64748B

### Navigation Bar
- Background: White
- Height: 64px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Safe area padding bottom: 34px (iPhone)

---

## 🎭 Role-Specific Themes

### Customer App
- Primary emotion: Hungry, Excited
- Color emphasis: Fresh Green, Warm Orange
- Imagery: Appetizing food photos, happy moments

### Driver App
- Primary emotion: Professional, Focused
- Color emphasis: Trust Blue, Success Green
- Imagery: Maps, vehicles, earnings

### Merchant App
- Primary emotion: Business, Growth
- Color emphasis: Success Green, Warning Orange
- Imagery: Analytics, orders, inventory

### Admin Dashboard
- Primary emotion: Control, Overview
- Color emphasis: Professional Blue, Neutral Gray
- Imagery: Data visualization, metrics

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px (Primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+ (Admin dashboard)

---

## ♿ Accessibility Standards

### Color Contrast
- Normal text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- Interactive elements: Clear visual states

### Touch Targets
- Minimum size: 44px x 44px
- Spacing between targets: 8px minimum

### Typography
- Line height: 1.5x font size minimum
- Letter spacing: 0.025em for small text
- Max line length: 65 characters

---

## 🎨 Visual Language

### Iconography
- Style: Outlined icons (Heroicons)
- Size: 20px, 24px, 32px
- Color: CurrentColor or semantic colors

### Imagery Style
- Food photography: Bright, appetizing, authentic
- People: Diverse, genuine, happy
- Illustrations: Friendly, rounded, approachable

### Animation Principles
- Duration: 200-300ms for micro-interactions
- Easing: ease-out for entrances, ease-in for exits
- Purpose: Guide attention, provide feedback

---

## 📊 Data Visualization

### Chart Colors (Saturated for visibility)
- Primary: #059669 (Green)
- Secondary: #EA580C (Orange)
- Tertiary: #1D4ED8 (Blue)
- Quaternary: #DC2626 (Red)

### Chart Types
- Bar charts: Revenue, orders
- Line charts: Trends over time
- Pie charts: Category breakdowns
- Heatmaps: Geographic data

---

## 🔧 Design Tokens (JSON Format)

```json
{
  "colors": {
    "primary": "#22C55E",
    "secondary": "#F97316",
    "accent": "#3B82F6",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "neutral": {
      "900": "#1F2937",
      "500": "#64748B",
      "100": "#F8FAFC"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "borderRadius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px"
  },
  "fontSize": {
    "hero": "2rem",
    "h1": "1.5rem",
    "body": "1rem",
    "small": "0.875rem"
  }
}
```

---

## 🚀 Implementation Guidelines

### CSS Variables
```css
:root {
  --color-primary: #22C55E;
  --color-secondary: #F97316;
  --spacing-md: 16px;
  --radius-md: 12px;
  --font-body: 'Inter', sans-serif;
}
```

### Component Usage
- Reuse components across all 4 apps
- Customize with role-specific theming
- Maintain consistency in interactions
- Document all variations

---

*Design System นี้รองรับการพัฒนาแอปเดลิเวอรี่ทั้ง 4 บทบาท พร้อมใช้งานจริง*
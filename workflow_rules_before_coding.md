# Workflow Rules Before Coding

## 1. Graphify First (Mandatory Before Editing Code)
- ห้ามเริ่มแก้โค้ดทันทีโดยไม่ค้นหาบริบทผ่าน Graphify ก่อน
- ทุกครั้งที่ได้รับงาน ให้สืบค้นจุดที่เกี่ยวข้อง (entry point, caller/callee, dependencies และ blast radius) จาก `graphify-out/` หรือเครื่องมือ Graphify ก่อน
- สรุปไฟล์และฟังก์ชันเป้าหมายที่ต้องแตะให้ชัดเจนก่อนวางแผน

## 2. Archify Diagram for Target Flow
- เมื่อได้จุดที่ต้องทำแล้ว ให้ใช้ Archify สร้างแผนภาพเฉพาะ flow นั้น (จำกัด 8–12 โหนด อ้างอิงเฉพาะไฟล์ที่มีอยู่จริงในโปรเจกต์) เพื่อยืนยันเส้นทางก่อนแก้โค้ด

## 3. Swarm Execution
- แยกงานย่อยที่อิสระต่อกันหลังได้ขอบเขตชัดเจน แล้วมอบหมายให้ Swarm / sub-agents ทำคู่ขนาน (เช่น แยกฝั่ง logic, tests และ docs/diagram)
- หลังแก้โค้ดเสร็จ ให้อัปเดตกราฟ Graphify และตรวจสอบผลลัพธ์รวมอีกครั้ง
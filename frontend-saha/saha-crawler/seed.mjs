import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seedDatabase() {
  try {
    const rawData = await fs.readFile('preview_data.json', 'utf-8');
    const scrapedProducts = JSON.parse(rawData);

    for (const item of scrapedProducts) {
      // 1. Trích xuất dữ liệu để khớp với kiểu dữ liệu VARCHAR(100) của DB
      const originValue = item.specs['Nước sản xuất'] || item.specs['Thương hiệu'] || 'Chưa rõ';
      const specValue = item.specs['Quy cách'] || item.specs['Dạng bào chế'] || 'Chưa rõ';
      
      // Xử lý mô tả ngắn gọn cho giao diện Web
      const shortDescription = item.fullContent ? item.fullContent.substring(0, 500) + '...' : 'Chưa có mô tả';

      // 2. Insert vào bảng products
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert([
          { 
            name: item.name, 
            price: item.price, 
            image_url: item.imgUrl,
            origin: originValue.substring(0, 100), // Cắt ngắn để tránh vượt giới hạn 100 ký tự
            specs: specValue.substring(0, 100),
            description: shortDescription,
            category_id: 1 // Cố định danh mục 1 (Vitamin) tương ứng với link đã cào
          }
        ])
        .select(); 

      if (productError) {
        console.error(`Loi insert san pham [${item.name}]:`, productError.message);
        continue;
      }

      const newProductId = insertedProduct[0].id;

      // 3. Insert dữ liệu thô vào bảng ai_knowledge_base cho Dược sĩ AI
      const aiContent = `[Thông số Kỹ thuật]: ${JSON.stringify(item.specs, null, 2)}\n\n[Nội dung chi tiết]:\n${item.fullContent}`;

      const { error: aiError } = await supabase
        .from('ai_knowledge_base')
        .insert([
          {
            product_id: newProductId,
            full_content: aiContent
          }
        ]);

      if (aiError) {
        console.error(`Loi insert AI Data [${item.name}]:`, aiError.message);
      } else {
        console.log(`Dong bo thanh cong: ${item.name}`);
      }
    }

    console.log("Hoan tat toan bo quy trinh nap du lieu.");

  } catch (error) {
    console.error("Loi he thong:", error.message);
  }
}

seedDatabase();
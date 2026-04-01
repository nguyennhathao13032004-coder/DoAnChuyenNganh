import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

puppeteer.use(StealthPlugin());

const randomDelay = (min, max) => {
  const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delayTime));
};

async function runBatchCrawler() {
  const browser = await puppeteer.launch({ headless: false }); 
  
  const targetCategories = [
    { name: 'vitamin-khoang-chat', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/vitamin-khoang-chat' },
    { name: 'mien-dich-de-khang', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/ho-tro-mien-dich-tang-suc-de-khang' },
    { name: 'sinh-ly-noi-tiet-to', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/sinh-ly-noi-tiet-to' },
    { name: 'mat-thi-luc', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/bao-ve-mat' },
    { name: 'tieu-hoa', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/ho-tro-tieu-hoa' },
    { name: 'than-kinh-nao', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/than-kinh-nao' },
    { name: 'ho-tro-lam-dep', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/ho-tro-lam-dep' },
    { name: 'duong-huyet-tieu-duong', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/duong-huyet-tieu-duong' },
    { name: 'tim-mach-huyet-ap', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/tim-mach-huyet-ap' },
    { name: 'ho-hap-tai-mui-hong', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/ho-hap-tai-mui-hong' },
    { name: 'co-xuong-khop', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/co-xuong-khop' },
    { name: 'gan-mat', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/gan-mat' },
    { name: 'than-tiet-nieu', url: 'https://nhathuoclongchau.com.vn/thuc-pham-chuc-nang/than-tiet-nieu' }
  ];

  try {
    for (const category of targetCategories) {
      console.log(`\n=======================================`);
      console.log(`BẮT ĐẦU CÀO DANH MỤC: ${category.name}`);
      console.log(`=======================================\n`);

      const page = await browser.newPage();
      await page.goto(category.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await randomDelay(4000, 7000);

      // Thu thập link sản phẩm (CHỈ lọc các link thuộc thực phẩm chức năng)
      const productLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/thuc-pham-chuc-nang/"][href$=".html"]'));
        return [...new Set(links.map(a => a.href))]; 
      });

      console.log(`Tìm thấy ${productLinks.length} sản phẩm hợp lệ trong mục ${category.name}.`);
      const categoryData = [];

      for (let i = 0; i < productLinks.length; i++) {
        const link = productLinks[i];
        console.log(`[${i+1}/${productLinks.length}] Đang xử lý: ${link}`);
        
        try {
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await randomDelay(3000, 5000); 

          // Bóc tách dữ liệu
          const productData = await page.evaluate(() => {
            const name = document.querySelector('h1')?.innerText.trim() || null;
            const imgUrl = document.querySelector('meta[property="og:image"]')?.content || null;
            const source_url = document.location.href;

            let price = 0;
            const allText = document.body.innerText;
            const priceMatches = allText.match(/(\d{1,3}(?:\.\d{3})+)\s*đ/g);
            if (priceMatches && priceMatches.length > 0) {
                price = parseInt(priceMatches[0].replace(/\D/g, '')) || 0;
            }

            const specs = {};
            const specKeys = ["Thành phần", "Dạng bào chế", "Quy cách", "Nhà sản xuất", "Nước sản xuất", "Hạn sử dụng", "Số đăng ký"];
            const textElements = document.querySelectorAll('span, p, div, li');
            textElements.forEach(el => {
                const txt = el.innerText?.trim();
                if (specKeys.includes(txt) && el.children.length === 0) {
                    let valueEl = el.nextElementSibling || el.parentElement?.nextElementSibling;
                    if (valueEl) specs[txt] = valueEl.innerText.trim();
                }
            });

            let fullContent = "";
            const sectionTitles = ["Công dụng", "Cách dùng", "Tác dụng phụ", "Lưu ý", "Mô tả sản phẩm"];
            const headings = document.querySelectorAll('h2, h3, h4, .font-bold');

            headings.forEach(heading => {
                const title = heading.innerText.trim();
                if (sectionTitles.some(s => title.includes(s))) {
                    fullContent += `\n--- [${title}] ---\n`;
                    let nextEl = heading.nextElementSibling;
                    let paragraphCount = 0;
                    
                    while (nextEl && paragraphCount < 20) {
                        if (['H2', 'H3', 'H4'].includes(nextEl.tagName)) break; 
                        const text = nextEl.innerText.trim();
                        if (text && !text.includes('Xem thêm') && text.length > 10) {
                            fullContent += text + '\n';
                        }
                        nextEl = nextEl.nextElementSibling;
                        paragraphCount++;
                    }
                }
            });

            // Lệnh return bắt buộc phải có để tránh lỗi undefined
            return { 
              name, 
              price, 
              imgUrl, 
              specs, 
              fullContent: fullContent.trim(), 
              source_url 
            };
          });

          // Chỉ push vào mảng nếu lấy được tên sản phẩm hợp lệ
          if (productData && productData.name) {
            categoryData.push(productData);
          }
        } catch (err) {
          console.error(`Lỗi tại link ${link}:`, err.message);
          continue; 
        }
      }

      await fs.writeFile(`${category.name}.json`, JSON.stringify(categoryData, null, 2), 'utf-8');
      console.log(`Đã xuất file: ${category.name}.json`);

      await page.close();

      console.log("Hệ thống đang nghỉ 30 giây để tránh bị block IP...");
      await randomDelay(30000, 40000); 
    }

  } catch (error) {
    console.error("Lỗi kịch bản tổng:", error.message);
  } finally {
    await browser.close();
    console.log("Hoàn thành toàn bộ quy trình cào dữ liệu theo lô.");
  }
}

runBatchCrawler();
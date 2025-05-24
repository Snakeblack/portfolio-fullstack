import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // Import sharp

// Read portfolio data
const portfolioPath = path.resolve('src/data/portfolio.json');
const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
const projects = portfolioData.projects;

const screenshotsDir = path.resolve('public/assets/screenshots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 }); // Set viewport size

  for (const project of projects) {
    const projectNameSlug = project.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const screenshotPathPNG = path.join(screenshotsDir, `${projectNameSlug}.png`);
    const screenshotPathWEBP = path.join(screenshotsDir, `${projectNameSlug}.webp`);

    try {
      console.log(`Capturing screenshot for ${project.name} (${project.url})`);
      await page.goto(project.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      const screenshotBuffer = await page.screenshot({ fullPage: false }); // fullPage: false, as viewport is set
      console.log(`Screenshot captured for ${project.name}`);

      // Crop and convert to WebP
      // Ensure the screenshot is at least 1920 wide for the crop, 
      // or adjust crop width if screenshot is smaller but maintain 16:9
      const image = sharp(screenshotBuffer);
      const metadata = await image.metadata();

      let cropWidth = 1920;
      let cropHeight = 1080;

      if (metadata.width && metadata.width < 1920) {
        cropWidth = metadata.width;
        cropHeight = Math.floor(metadata.width * (9 / 16));
      }
      // Ensure cropHeight is not greater than actual image height
      if (metadata.height && cropHeight > metadata.height) {
        cropHeight = metadata.height;
        // Optionally adjust cropWidth to maintain 16:9 if height is the constraint
        // cropWidth = Math.floor(metadata.height * (16 / 9)); 
      }

      await image
        .extract({ left: 0, top: 0, width: cropWidth, height: cropHeight })
        .webp({ quality: 80 })
        .toFile(screenshotPathWEBP);

      console.log(`Screenshot saved and converted to ${screenshotPathWEBP}`);
      project.screenshot = `/assets/screenshots/${projectNameSlug}.webp`; // Update to .webp

      // Optionally, remove the PNG file if you no longer need it
      // fs.unlinkSync(screenshotPathPNG);

    } catch (error) {
      console.error(`Failed to capture screenshot for ${project.name} (${project.url}):`, error);
      project.screenshot = ''; // or a placeholder image path
    }
  }

  await browser.close();

  // Update portfolio.json with screenshot paths
  fs.writeFileSync(portfolioPath, JSON.stringify(portfolioData, null, 2));
  console.log('portfolio.json updated with screenshot paths.');
})();

export interface ComposedLogoOptions {
  businessName: string;
  iconImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontSize?: number;
  fontFamily?: string;
  layout?: 'horizontal' | 'vertical' | 'stacked';
}

export async function composeLogoWithText(options: ComposedLogoOptions): Promise<string> {
  const {
    businessName,
    iconImageUrl,
    primaryColor,
    fontSize = 48,
    fontFamily = 'Arial, sans-serif',
    layout = 'horizontal'
  } = options;

  try {
    const response = await fetch(iconImageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          if (layout === 'horizontal') {
            const iconSize = 200;
            const padding = 40;
            const textWidth = measureTextWidth(ctx, businessName, fontSize, fontFamily);

            canvas.width = iconSize + padding + textWidth + 80;
            canvas.height = Math.max(iconSize, fontSize * 1.5) + 80;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const iconY = (canvas.height - iconSize) / 2;
            ctx.drawImage(img, 40, iconY, iconSize, iconSize);

            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = primaryColor;
            ctx.textBaseline = 'middle';
            const textY = canvas.height / 2;
            const textX = 40 + iconSize + padding;
            ctx.fillText(businessName, textX, textY);

          } else if (layout === 'vertical') {
            const iconSize = 200;
            const padding = 30;

            canvas.width = Math.max(iconSize, measureTextWidth(ctx, businessName, fontSize, fontFamily)) + 80;
            canvas.height = iconSize + padding + fontSize * 1.5 + 80;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const iconX = (canvas.width - iconSize) / 2;
            ctx.drawImage(img, iconX, 40, iconSize, iconSize);

            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = primaryColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textY = 40 + iconSize + padding + (fontSize * 1.5) / 2;
            ctx.fillText(businessName, canvas.width / 2, textY);

          } else {
            const iconSize = 150;
            const padding = 20;
            const textWidth = measureTextWidth(ctx, businessName, fontSize, fontFamily);

            canvas.width = Math.max(iconSize, textWidth) + 80;
            canvas.height = iconSize + padding + fontSize * 1.5 + 80;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const iconX = (canvas.width - iconSize) / 2;
            ctx.drawImage(img, iconX, 40, iconSize, iconSize);

            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = primaryColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textY = 40 + iconSize + padding + (fontSize * 1.5) / 2;
            ctx.fillText(businessName, canvas.width / 2, textY);
          }

          const dataUrl = canvas.toDataURL('image/png', 1.0);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);

        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load icon image'));
      };

      img.src = objectUrl;
    });
  } catch (error) {
    throw new Error(`Failed to fetch icon image: ${error}`);
  }
}

function measureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string
): number {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

export function generateIconOnlyPrompt(
  businessDescription: string,
  brandPersonality: string,
  colors: { primary: string; secondary: string; accent: string },
  style: string
): string {
  return `Ultra-modern minimal icon symbol for ${businessDescription}. Personality: ${brandPersonality}. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Style: ${style}. CRITICAL: NO TEXT OR LETTERS. Icon/symbol only. MUST BE: Ultra clean, minimalist, flat design, simple geometric shapes, lots of white space, contemporary tech aesthetic. NO gradients, NO 3D effects, NO vintage, NO ornate details, NO complex illustrations. Maximum simplicity. Modern and sleek only. Centered on white background.`;
}

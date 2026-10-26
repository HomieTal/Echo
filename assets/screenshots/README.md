# Echo OS screenshots — drop-in slots

The homepage is built to show **genuine captures only**. Until a capture exists,
the site displays verified build facts in the same frame. Do not replace the
fallback with a mockup, a stock desktop, or an AI-generated image.

## Required files

| File | Frame | Recommended capture | Current state |
| --- | --- | --- | --- |
| `live-session.webp` | Wide hero slot, 21:9 | 2100 × 900 | Pending |
| `installer.webp` | Half-width slot, 16:10 | 1600 × 1000 | Pending |
| `boot.webp` | Half-width slot, 16:10 | 1600 × 1000 | Pending |

The site loads these files automatically. When one loads successfully, its
fallback is hidden and the image is shown. If a file is missing, the fallback
stays visible; there is no broken-image icon.

## Capture checklist

- Capture from the **public preview ISO** (`v2026.10.24`) so the page and the
  download stay in sync. Do not publish captures from an unreleased local build.
- Use a clean VM or hardware. Redact usernames, hostnames, IP addresses,
  serial numbers, MAC addresses, email addresses, and any personal files.
- `live-session.webp`: the XFCE desktop after autologin. Show the installer
  launcher or menu if possible. Do not add applications that are not in the ISO.
- `installer.webp`: Calamares running on Echo OS. Stock Calamares branding is
  expected in the current preview; do not imply Echo-specific branding exists.
- `boot.webp`: the real BIOS or UEFI boot menu, or the live boot screen. Avoid
  vendor logos and firmware serial numbers.
- Crop only; do not retouch the desktop, add fake windows, or composite UI.
- Export WebP, sRGB, quality 82–88. Keep file sizes under ~450 KB each.
- Add useful alt text in `index.html` if the scene changes. The existing alt text
  describes the intended capture.
- Verify at 1440 px, 768 px, and 390 px widths, and confirm the fallback is gone.

## Why the fallback exists

The current site is intentionally shippable without screenshots. The fallback
lists real build facts (XFCE live session, Calamares 3.4.2, BIOS/UEFI, offline
install) and is labelled as a reserved capture. This keeps the page honest while
the visual capture work is pending.

## After adding captures

1. Put the three files in this directory with the exact names above.
2. Run the local server and check the Proof section at desktop and mobile sizes.
3. Confirm the images are sharp, correctly cropped, and contain no personal data.
4. Update the caption/alt text only if the actual scene differs.
5. Do not commit the ISO itself to the website repository.

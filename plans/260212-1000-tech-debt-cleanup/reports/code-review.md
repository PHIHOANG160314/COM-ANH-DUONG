# Code Review Report
## TODOs and FIXMEs
No TODOs found
## Console Logs
src/features/cart/model/cart-store.test.ts:    // Mock console.error
src/shared/utils/debug.ts:      console.log(...args);
src/shared/utils/debug.ts:      console.warn(...args);
src/shared/utils/debug.ts:      console.error(...args);
## Linting Issues

> com-anh-duong-10x@0.0.0 lint
> eslint .


/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/legacy/js/shipper.js
  279:24  error  Parsing error: Unexpected token if

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/scripts/check-data.ts
   5:31  warning  Replace `⏎····process.env.VITE_SUPABASE_URL!,⏎····process.env.VITE_SUPABASE_ANON_KEY!⏎` with `process.env.VITE_SUPABASE_URL!,·process.env.VITE_SUPABASE_ANON_KEY!`  prettier/prettier
  11:1   warning  Replace `····` with `··`                                                                                                                                            prettier/prettier
  12:1   warning  Delete `··`                                                                                                                                                         prettier/prettier
  14:3   warning  Delete `··`                                                                                                                                                         prettier/prettier
  15:1   warning  Replace `········` with `····`                                                                                                                                      prettier/prettier
  16:1   warning  Replace `········` with `····`                                                                                                                                      prettier/prettier
  17:3   warning  Delete `··`                                                                                                                                                         prettier/prettier
  19:1   warning  Replace `····const·activeCount·=·data?.filter(d` with `··const·activeCount·=·data?.filter((d)`                                                                      prettier/prettier
  20:3   warning  Replace `··const·inactiveCount·=·data?.filter(d` with `const·inactiveCount·=·data?.filter((d)`                                                                      prettier/prettier
  22:1   warning  Delete `··`                                                                                                                                                         prettier/prettier
  23:3   warning  Delete `··`                                                                                                                                                         prettier/prettier
  24:1   warning  Replace `····` with `··`                                                                                                                                            prettier/prettier
  25:1   warning  Delete `··`                                                                                                                                                         prettier/prettier
  26:1   warning  Delete `··`                                                                                                                                                         prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/scripts/upload-menu-images.ts
   31:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   32:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   33:3  warning  Replace `··console.error('···Get·SERVICE_ROLE_KEY·from:·Supabase·Dashboard·→·Settings·→·API·→·service_role·key'` with `console.error(⏎····'···Get·SERVICE_ROLE_KEY·from:·Supabase·Dashboard·→·Settings·→·API·→·service_role·key'⏎··`  prettier/prettier
   34:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   38:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   39:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   40:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   44:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   48:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   52:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   54:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   55:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   56:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
   57:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   59:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   61:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   62:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
   63:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   64:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   66:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   67:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   68:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   69:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
   70:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   71:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   73:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   74:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   75:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   76:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   78:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   82:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   83:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   84:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
   85:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   86:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   88:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   89:3  warning  Replace `··const·files·=·fs.readdirSync(IMAGES_DIR)` with `const·files·=·fs⏎····.readdirSync(IMAGES_DIR)⏎····`                                                                                                                        prettier/prettier
   91:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   93:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   94:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   95:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
   96:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
   98:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
   99:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
  101:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  102:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  103:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  104:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  105:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  106:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  107:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
  109:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  110:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  111:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  113:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  114:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  115:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  117:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  118:7  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  119:1  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  120:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  122:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  123:1  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  124:7  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  125:1  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  126:7  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  127:7  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  128:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  129:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  131:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  132:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  133:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
  135:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  136:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  138:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  139:1  warning  Replace `········` with `····`                                                                                                                                                                                                        prettier/prettier
  140:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  141:1  warning  Replace `············` with `······`                                                                                                                                                                                                  prettier/prettier
  142:1  warning  Delete `······`                                                                                                                                                                                                                       prettier/prettier
  143:5  warning  Delete `····`                                                                                                                                                                                                                         prettier/prettier
  144:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  148:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  149:1  warning  Replace `····` with `··`                                                                                                                                                                                                              prettier/prettier
  150:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  151:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  153:3  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier
  154:1  warning  Delete `··`                                                                                                                                                                                                                           prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/app/providers/auth-provider.tsx
  45:16  error  'err' is defined but never used     @typescript-eslint/no-unused-vars
  64:15  error  '_error' is defined but never used  @typescript-eslint/no-unused-vars

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/admin/menu/api/use-daily-menu-mutation.ts
   6:3   warning  Delete `··`                                                                                                                                                                                                                               prettier/prettier
   7:1   warning  Delete `··`                                                                                                                                                                                                                               prettier/prettier
   9:1   warning  Delete `··`                                                                                                                                                                                                                               prettier/prettier
  10:5   warning  Delete `····`                                                                                                                                                                                                                             prettier/prettier
  11:1   warning  Replace `············` with `······`                                                                                                                                                                                                      prettier/prettier
  12:7   warning  Delete `······`                                                                                                                                                                                                                           prettier/prettier
  13:1   warning  Replace `················` with `········`                                                                                                                                                                                                prettier/prettier
  14:1   warning  Replace `················` with `········`                                                                                                                                                                                                prettier/prettier
  15:9   warning  Replace `········await·supabase⏎····················.from('daily_menus')⏎····················.delete()⏎····················.eq('date',·today)⏎····················` with `await·supabase.from('daily_menus').delete().eq('date',·today)`  prettier/prettier
  21:9   warning  Replace `········const·{·error·}·=·await·supabase.from('daily_menus')` with `const·{·error·}·=·await·supabase⏎··········.from('daily_menus')⏎··········`                                                                                  prettier/prettier
  22:1   warning  Replace `····················` with `············`                                                                                                                                                                                        prettier/prettier
  23:1   warning  Delete `········`                                                                                                                                                                                                                         prettier/prettier
  24:13  warning  Delete `········`                                                                                                                                                                                                                         prettier/prettier
  25:11  warning  Replace `······})` with `})⏎··········`                                                                                                                                                                                                   prettier/prettier
  27:1   warning  Replace `················` with `········`                                                                                                                                                                                                prettier/prettier
  28:1   warning  Delete `··········`                                                                                                                                                                                                                       prettier/prettier
  29:9   warning  Delete `········`                                                                                                                                                                                                                         prettier/prettier
  30:1   warning  Replace `············` with `······`                                                                                                                                                                                                      prettier/prettier
  31:1   warning  Delete `········`                                                                                                                                                                                                                         prettier/prettier
  32:1   warning  Replace `················` with `········`                                                                                                                                                                                                prettier/prettier
  33:1   warning  Replace `····················` with `··········`                                                                                                                                                                                          prettier/prettier
  34:1   warning  Replace `····················` with `··········`                                                                                                                                                                                          prettier/prettier
  35:1   warning  Replace `····················` with `··········`                                                                                                                                                                                          prettier/prettier
  36:1   warning  Replace `····················` with `··········`                                                                                                                                                                                          prettier/prettier
  38:9   warning  Delete `········`                                                                                                                                                                                                                         prettier/prettier
  39:1   warning  Replace `····················` with `··········`                                                                                                                                                                                          prettier/prettier
  40:1   warning  Replace `················` with `········`                                                                                                                                                                                                prettier/prettier
  41:1   warning  Replace `············` with `······`                                                                                                                                                                                                      prettier/prettier
  42:1   warning  Replace `········` with `····`                                                                                                                                                                                                            prettier/prettier
  43:1   warning  Delete `····`                                                                                                                                                                                                                             prettier/prettier
  44:1   warning  Delete `······`                                                                                                                                                                                                                           prettier/prettier
  45:7   warning  Delete `······`                                                                                                                                                                                                                           prettier/prettier
  46:5   warning  Delete `····`                                                                                                                                                                                                                             prettier/prettier
  47:1   warning  Replace `········` with `····`                                                                                                                                                                                                            prettier/prettier
  47:19  error    '_err' is defined but never used                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
  48:1   warning  Delete `······`                                                                                                                                                                                                                           prettier/prettier
  49:1   warning  Replace `········` with `····`                                                                                                                                                                                                            prettier/prettier
  50:1   warning  Delete `····`                                                                                                                                                                                                                             prettier/prettier
  51:1   warning  Delete `······`                                                                                                                                                                                                                           prettier/prettier
  52:1   warning  Replace `············` with `······`                                                                                                                                                                                                      prettier/prettier
  53:5   warning  Delete `····`                                                                                                                                                                                                                             prettier/prettier
  54:1   warning  Delete `··`                                                                                                                                                                                                                               prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/admin/menu/dynamic-menu-manager.tsx
    7:1   warning  Delete `⏎`                                                                          prettier/prettier
   23:58  warning  Delete `⏎⏎⏎⏎`                                                                       prettier/prettier
   53:31  warning  Insert `,`                                                                          prettier/prettier
   72:28  warning  Insert `⏎·······`                                                                   prettier/prettier
  130:56  warning  Replace `Đang·lưu·thay·đổi...` with `⏎············Đang·lưu·thay·đổi...⏎··········`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/admin/products/use-admin-products.ts
  49:45  warning  Replace `.from('menu_items').insert(newProduct).select()` with `⏎········.from('menu_items')⏎········.insert(newProduct)⏎········.select()⏎········`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/bestseller/api/use-bestseller.ts
  107:16  error  'err' is defined but never used  @typescript-eslint/no-unused-vars
  188:12  error  'err' is defined but never used  @typescript-eslint/no-unused-vars
  226:12  error  'err' is defined but never used  @typescript-eslint/no-unused-vars

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/cart/components/cart-drawer.tsx
  179:18  warning  Replace `·p:·2,·borderTop:·'1px·solid',·borderColor:·'divider',·bgcolor:·'background.default'` with `⏎··············p:·2,⏎··············borderTop:·'1px·solid',⏎··············borderColor:·'divider',⏎··············bgcolor:·'background.default',⏎···········`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/checkout/components/checkout-trust-badges.tsx
   77:17  warning  Replace `·theme.palette.mode·===·'dark'⏎··········?·'rgba(74,·222,·128,·0.05)'⏎·········` with `⏎··········theme.palette.mode·===·'dark'·?·'rgba(74,·222,·128,·0.05)'`  prettier/prettier
  103:51  warning  Replace `⏎················?·'rgba(0,0,0,0.87)'⏎···············` with `·?·'rgba(0,0,0,0.87)'`                                                                            prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/checkout/components/delivery-form.tsx
   99:21  warning  Replace `⏎··········errors.phone?.message·||⏎··········'Định·dạng:·0xxx·xxx·xxx·hoặc·+84·xxx·xxx·xxx'⏎········` with `errors.phone?.message·||·'Định·dạng:·0xxx·xxx·xxx·hoặc·+84·xxx·xxx·xxx'`              prettier/prettier
  117:21  warning  Replace `⏎··········errors.address?.message·||⏎··········'VD:·123·Lê·Lợi,·Phường·Bến·Thành,·Quận·1,·TP.HCM'⏎········` with `errors.address?.message·||·'VD:·123·Lê·Lợi,·Phường·Bến·Thành,·Quận·1,·TP.HCM'`  prettier/prettier
  144:39  warning  Replace `⏎············Giờ·mở·cửa:·08:00·-·22:00.·Vui·lòng·quay·lại·sau!⏎··········` with `Giờ·mở·cửa:·08:00·-·22:00.·Vui·lòng·quay·lại·sau!`                                                                prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/checkout/components/payment-methods.tsx
   51:59  warning  Replace `⏎························?·'rgba(0,0,0,0.87)'⏎·······················` with `·?·'rgba(0,0,0,0.87)'`            prettier/prettier
   62:24  warning  Insert `⏎·················`                                                                                             prettier/prettier
   63:1   warning  Insert `··`                                                                                                             prettier/prettier
   64:1   warning  Insert `··`                                                                                                             prettier/prettier
   67:25  warning  Insert `⏎·················`                                                                                             prettier/prettier
   68:1   warning  Insert `··`                                                                                                             prettier/prettier
   69:21  warning  Insert `··`                                                                                                             prettier/prettier
   70:1   warning  Insert `··`                                                                                                             prettier/prettier
   71:1   warning  Insert `··`                                                                                                             prettier/prettier
   75:27  warning  Insert `⏎···················`                                                                                           prettier/prettier
   76:1   warning  Insert `··`                                                                                                             prettier/prettier
   77:1   warning  Insert `··`                                                                                                             prettier/prettier
   78:23  warning  Insert `··`                                                                                                             prettier/prettier
   79:1   warning  Insert `··`                                                                                                             prettier/prettier
  100:24  warning  Insert `⏎·················`                                                                                             prettier/prettier
  101:1   warning  Insert `··`                                                                                                             prettier/prettier
  102:1   warning  Insert `··`                                                                                                             prettier/prettier
  105:43  warning  Replace `⏎··················?·theme.palette.action.selected⏎·················` with `·?·theme.palette.action.selected`  prettier/prettier
  126:24  warning  Insert `⏎·················`                                                                                             prettier/prettier
  127:1   warning  Insert `··`                                                                                                             prettier/prettier
  128:1   warning  Insert `··`                                                                                                             prettier/prettier
  131:42  warning  Replace `⏎··················?·theme.palette.action.selected⏎·················` with `·?·theme.palette.action.selected`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/home/components/hero-section.tsx
  287:17  warning  Replace `·sx={{·p:·2,·textAlign:·'center',·bgcolor:·'background.paper',·color:·'text.primary'·}}` with `⏎············sx={{·p:·2,·textAlign:·'center',·bgcolor:·'background.paper',·color:·'text.primary'·}}⏎··········`                          prettier/prettier
  298:17  warning  Replace `·sx={{·p:·2,·textAlign:·'center',·bgcolor:·'background.paper',·color:·'text.primary'·}}` with `⏎············sx={{·p:·2,·textAlign:·'center',·bgcolor:·'background.paper',·color:·'text.primary'·}}⏎··········`                          prettier/prettier
  346:24  warning  Replace `·fontWeight="bold"·sx={{·color:·(theme)·=>·theme.palette.error.main,·fontSize:·'1.1rem'·}}` with `⏎··············fontWeight="bold"⏎··············sx={{·color:·(theme)·=>·theme.palette.error.main,·fontSize:·'1.1rem'·}}⏎············`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/api/use-favorites.ts
  11:1  warning  Delete `⏎`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/api/use-menu.test.tsx
   77:25  warning  Replace `{·id:·101,·name:·'Real·Food',·category_id:·'c1',·categories:·{·id:·'c1'·}·}` with `⏎········{·id:·101,·name:·'Real·Food',·category_id:·'c1',·categories:·{·id:·'c1'·}·},⏎······`  prettier/prettier
  153:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  155:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  156:1   warning  Replace `········` with `······`                                                                                                                                                           prettier/prettier
  157:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  158:1   warning  Replace `··········` with `········`                                                                                                                                                       prettier/prettier
  159:9   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  160:1   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  162:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  163:1   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  164:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  165:1   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  166:1   warning  Replace `··········` with `········`                                                                                                                                                       prettier/prettier
  167:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  169:1   warning  Replace `········` with `······`                                                                                                                                                           prettier/prettier
  171:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  173:1   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  174:7   warning  Delete `··`                                                                                                                                                                                prettier/prettier
  175:1   warning  Delete `··`                                                                                                                                                                                prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/api/use-menu.ts
  112:1   warning  Delete `⏎`                       prettier/prettier
  113:16  error    'err' is defined but never used  @typescript-eslint/no-unused-vars
  154:57  warning  Replace `d` with `(d)`           prettier/prettier
  178:16  error    'err' is defined but never used  @typescript-eslint/no-unused-vars
  207:16  error    'err' is defined but never used  @typescript-eslint/no-unused-vars

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/components/menu-grid.tsx
  113:15  warning  Insert `··`            prettier/prettier
  114:15  warning  Insert `··`            prettier/prettier
  115:1   warning  Insert `··`            prettier/prettier
  127:29  warning  Delete `⏎···········`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/components/menu-showcase.test.tsx
   17:67  warning  Insert `,`   prettier/prettier
   57:45  warning  Insert `,`   prettier/prettier
   70:7   warning  Delete `··`  prettier/prettier
   71:1   warning  Delete `··`  prettier/prettier
  131:29  warning  Insert `,`   prettier/prettier
  139:29  warning  Insert `,`   prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/components/menu-showcase.tsx
  119:26  warning  Replace `·icon="🍰"·name="Tráng·Miệng"·onClick={()·=>·handleCategoryClick('cat-9')}` with `⏎··············icon="🍰"⏎··············name="Tráng·Miệng"⏎··············onClick={()·=>·handleCategoryClick('cat-9')}⏎···········`  prettier/prettier
  122:19  warning  Delete `⏎`                                                                                                                                                                                                                    prettier/prettier
  184:18  warning  Replace `⏎··········selectedCategoryId={activeCategory}⏎··········onCategoryChange={setActiveCategory}⏎·······` with `·selectedCategoryId={activeCategory}·onCategoryChange={setActiveCategory}`                              prettier/prettier
  232:33  warning  Insert `,`                                                                                                                                                                                                                    prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/menu/hooks/use-pull-to-refresh.ts
  47:39  warning  Insert `⏎····`                                                                           prettier/prettier
  48:1   warning  Insert `··`                                                                              prettier/prettier
  50:1   warning  Replace `····` with `······`                                                             prettier/prettier
  51:1   warning  Insert `··`                                                                              prettier/prettier
  53:1   warning  Replace `····` with `······`                                                             prettier/prettier
  54:5   warning  Insert `··`                                                                              prettier/prettier
  55:1   warning  Replace `······` with `········`                                                         prettier/prettier
  56:1   warning  Insert `··`                                                                              prettier/prettier
  57:1   warning  Replace `······` with `········`                                                         prettier/prettier
  58:5   warning  Insert `··`                                                                              prettier/prettier
  59:1   warning  Replace `··},·[isRefreshing,·threshold]` with `····},⏎····[isRefreshing,·threshold]⏎··`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/orders/context/order-notification-provider.tsx
  39:39  warning  Replace `.then(setPermission)` with `⏎········.then(setPermission)⏎········`  prettier/prettier
  79:44  error    '_err' is defined but never used                                              @typescript-eslint/no-unused-vars

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/payment/components/payment-method-selector.tsx
  63:20  warning  Replace `·mb:·1,·p:·1,·border:·'1px·solid',·borderColor:·'divider',·borderRadius:·1,·mx:·0` with `⏎················mb:·1,⏎················p:·1,⏎················border:·'1px·solid',⏎················borderColor:·'divider',⏎················borderRadius:·1,⏎················mx:·0,⏎·············`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/features/pos/components/pos-cart.tsx
  103:11  warning  Replace `·sx={{·p:·2,·borderTop:·'1px·solid',·borderColor:·'divider',·bgcolor:·'background.default'·}}` with `⏎········sx={{·p:·2,·borderTop:·'1px·solid',·borderColor:·'divider',·bgcolor:·'background.default'·}}⏎······`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/pages/customer/home-page.tsx
  121:17  warning  Replace `⏎········open={isCartOpen}⏎········onClose={()·=>·setIsCartOpen(false)}⏎·····` with `·open={isCartOpen}·onClose={()·=>·setIsCartOpen(false)}`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/pages/staff/staff-mobile-pos-page.tsx
  49:33  warning  Insert `,`                       prettier/prettier
  74:14  error    'err' is defined but never used  @typescript-eslint/no-unused-vars

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/api/supabase-client.ts
  15:25  error  Empty block statement  no-empty

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/layouts/main-layout.tsx
  231:51  warning  Replace `⏎············{children·||·<Outlet·/>}⏎··········` with `{children·||·<Outlet·/>}`  prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/lib/image-utils.ts
  12:1   warning  Delete `··`                                                                                                          prettier/prettier
  18:1   warning  Delete `··`                                                                                                          prettier/prettier
  24:1   warning  Delete `··`                                                                                                          prettier/prettier
  32:67  warning  Replace `·webp:·string·|·null;·fallback:·string·|·null·` with `⏎··webp:·string·|·null;⏎··fallback:·string·|·null;⏎`  prettier/prettier
  36:1   warning  Delete `··`                                                                                                          prettier/prettier
  41:41  warning  Replace `⏎········?·`${url}&format=webp`·⏎········` with `?·`${url}&format=webp`·`                                   prettier/prettier
  48:1   warning  Delete `··`                                                                                                          prettier/prettier
  54:1   warning  Delete `··`                                                                                                          prettier/prettier
  63:1   warning  Delete `··`                                                                                                          prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/types/database.types.ts
  110:11  warning  Insert `··`                               prettier/prettier
  111:1   warning  Insert `··`                               prettier/prettier
  112:11  warning  Insert `··`                               prettier/prettier
  113:1   warning  Replace `··········` with `············`  prettier/prettier
  114:1   warning  Insert `··`                               prettier/prettier
  115:11  warning  Insert `··`                               prettier/prettier
  116:1   warning  Insert `··`                               prettier/prettier
  131:11  warning  Insert `··`                               prettier/prettier
  132:1   warning  Insert `··`                               prettier/prettier
  133:11  warning  Insert `··`                               prettier/prettier
  134:1   warning  Replace `··········` with `············`  prettier/prettier
  135:1   warning  Insert `··`                               prettier/prettier
  136:11  warning  Insert `··`                               prettier/prettier
  137:1   warning  Insert `··`                               prettier/prettier
  152:11  warning  Insert `··`                               prettier/prettier
  153:1   warning  Insert `··`                               prettier/prettier
  154:11  warning  Insert `··`                               prettier/prettier
  155:1   warning  Replace `··········` with `············`  prettier/prettier
  156:1   warning  Insert `··`                               prettier/prettier
  157:11  warning  Insert `··`                               prettier/prettier
  158:1   warning  Insert `··`                               prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/ui/error-boundary.tsx
  24:21  error    '_error' is defined but never used      @typescript-eslint/no-unused-vars
  24:36  error    '_errorInfo' is defined but never used  @typescript-eslint/no-unused-vars
  24:66  warning  Delete `⏎··`                            prettier/prettier
  32:74  warning  Delete `⏎`                              prettier/prettier
  71:9   warning  Delete `⏎`                              prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/ui/lazy-page.tsx
  12:43  warning  Replace `⏎··{·children:·ReactNode·},⏎··{·hasError:·boolean·}⏎` with `{·children:·ReactNode·},·{·hasError:·boolean·}`                                                                                                                                                                                           prettier/prettier
  28:13  warning  Replace `·display="flex"·flexDirection="column"·alignItems="center"·justifyContent="center"·minHeight="50vh"·gap={2}` with `⏎··········display="flex"⏎··········flexDirection="column"⏎··········alignItems="center"⏎··········justifyContent="center"⏎··········minHeight="50vh"⏎··········gap={2}⏎········`  prettier/prettier
  29:50  warning  Replace `Không·thể·tải·trang` with `⏎············Không·thể·tải·trang⏎··········`                                                                                                                                                                                                                               prettier/prettier
  30:62  warning  Replace `Vui·lòng·kiểm·tra·kết·nối·mạng.` with `⏎············Vui·lòng·kiểm·tra·kết·nối·mạng.⏎··········`                                                                                                                                                                                                       prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/ui/page-transition.tsx
   1:24  warning  Replace `"framer-motion"` with `'framer-motion'`  prettier/prettier
   2:32  warning  Replace `"react"` with `'react'`                  prettier/prettier
  19:41  warning  Replace `"easeOut"` with `'easeOut'`              prettier/prettier
  20:21  warning  Replace `"100%"` with `'100%'`                    prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/shared/utils/store-hours.ts
   3:1   warning  Delete `⏎`                     prettier/prettier
  23:12  error    'e' is defined but never used  @typescript-eslint/no-unused-vars
  23:15  error    Empty block statement          no-empty
  23:16  warning  Delete `⏎··`                   prettier/prettier

/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/src/utils/safari-compat-polyfills.ts
   3:3   warning  Delete `·`                                                                                                                                                                              prettier/prettier
  16:3   warning  Unused eslint-disable directive (no problems were reported from 'no-extend-native')
  35:3   warning  Unused eslint-disable directive (no problems were reported from 'no-extend-native')
  48:3   warning  Unused eslint-disable directive (no problems were reported from 'no-extend-native')
  53:31  warning  Replace `'String.prototype.replaceAll·called·with·a·non-global·RegExp·argument'` with `⏎············'String.prototype.replaceAll·called·with·a·non-global·RegExp·argument'⏎··········`  prettier/prettier

✖ 297 problems (17 errors, 280 warnings)
  0 errors and 280 warnings potentially fixable with the `--fix` option.

npm error Lifecycle script `lint` failed with error:
npm error code 1
npm error path /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x
npm error workspace com-anh-duong-10x@0.0.0
npm error location /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x
npm error command failed
npm error command sh -c eslint .
Linting failed
## Type Check

> com-anh-duong-10x@0.0.0 type-check
> tsc --noEmit


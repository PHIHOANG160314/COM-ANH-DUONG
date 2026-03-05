import * as XLSX from 'xlsx';
import type { ParsedMenuItem } from '@/features/admin/menu/api/use-import-menu-mutation';

export const importFromExcel = async (
    file: File
): Promise<ParsedMenuItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error('Could not read file data');
                }

                // Parse excel file
                const workbook = XLSX.read(data, { type: 'binary' });

                // Assume first sheet contains the data
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: '', // default value for empty cells
                    raw: false, // use formatted strings instead of raw values
                }) as Record<string, string | number>[];

                // Filter out empty rows (e.g. if the user left trailing blank rows)
                const filteredData = jsonData.filter(
                    (row) => row['Tên món ăn'] && String(row['Tên món ăn']).trim() !== ''
                );

                // Map and validate the data format based on expected headers
                const finalData: ParsedMenuItem[] = filteredData.map((row) => {
                    // Xử lý giá tiền (loại bỏ phẩy, khoảng trắng, đ, vnd)
                    let rawPrice = row['Giá bán (VNĐ)'];
                    let price = 0;

                    if (typeof rawPrice === 'string') {
                        price = Number(rawPrice.replace(/[^0-9.-]+/g, ''));
                    } else if (typeof rawPrice === 'number') {
                        price = rawPrice;
                    }

                    return {
                        'Tên món ăn': String(row['Tên món ăn'] || '').trim(),
                        'Giá bán (VNĐ)': price || 0,
                        'Loại món': String(row['Loại món'] || '').trim(),
                    };
                });

                resolve(finalData);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => {
            reject(err);
        };

        reader.readAsBinaryString(file);
    });
};

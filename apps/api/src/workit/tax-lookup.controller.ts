import { Controller, Get, Param, HttpException, HttpStatus } from "@nestjs/common";

interface TaxLookupResponse {
  taxCode: string;
  name: string;
  shortName?: string;
  address?: string;
  status?: string;
  source: string;
}

// Fallback directory for common coconut/agricultural enterprises in Ben Tre / South VN
const FALLBACK_BUSINESS_DIRECTORY: Record<string, { name: string; shortName?: string; address: string; status: string }> = {
  "1300994511": {
    name: "CÔNG TY TNHH CHẾ BIẾN DỪA LƯƠNG QUỚI",
    shortName: "VIETCOCO",
    address: "Lô A36-A37, KCN An Hiệp, Huyện Châu Thành, Tỉnh Bến Tre",
    status: "NNT đang hoạt động"
  },
  "1300984859": {
    name: "CÔNG TY CỔ PHẦN ĐẦU TƯ DỪA BẾN TRE (BECO)",
    shortName: "BECO",
    address: "Số 226/1 Thủ Khoa Huân, Phường Bình Khởi, TP. Bến Tre, Tỉnh Bến Tre",
    status: "NNT đang hoạt động"
  },
  "0313886566": {
    name: "CÔNG TY TNHH XNK NÔNG SẢN BẾN TRE",
    shortName: "BEN TRE AGRI",
    address: "Ấp 3, Xã Lương Hòa, Huyện Giồng Trôm, Tỉnh Bến Tre",
    status: "NNT đang hoạt động"
  },
  "1300918730": {
    name: "CÔNG TY TNHH DẦU THỰC VẬT BẾN TRE",
    shortName: "BETRECOIL",
    address: "154A Nguyễn Đình Chiểu, Phường An Hội, TP. Bến Tre",
    status: "NNT đang hoạt động"
  },
  "0316492008": {
    name: "CÔNG TY TNHH DẦU THỰC VẬT ĐỒNG NAI",
    shortName: "DONG NAI VEG OIL",
    address: "KCN Biên Hòa 1, Phường An Bình, TP. Biên Hòa, Tỉnh Đồng Nai",
    status: "NNT đang hoạt động"
  },
  "0300588569": {
    name: "CÔNG TY CỔ PHẦN SỮA VIỆT NAM",
    shortName: "VINAMILK",
    address: "10 Tân Trào, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
    status: "NNT đang hoạt động"
  },
  "0101243150": {
    name: "CÔNG TY CỔ PHẦN MISA",
    shortName: "MISA JSC",
    address: "Tầng 9, Tòa nhà Technosoft, Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    status: "NNT đang hoạt động"
  },
  "0100109106": {
    name: "TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI",
    shortName: "VIETTEL",
    address: "Số 1 Trần Hữu Dực, Phường Mỹ Đình 2, Quận Nam Từ Liêm, Hà Nội",
    status: "NNT đang hoạt động"
  }
};

@Controller("tax-lookup")
export class TaxLookupController {
  @Get(":taxCode")
  async lookupTaxCode(@Param("taxCode") taxCode: string): Promise<TaxLookupResponse> {
    const cleanTaxCode = taxCode.trim().replace(/[^0-9-]/g, "");

    if (!cleanTaxCode || cleanTaxCode.length < 8) {
      throw new HttpException("Mã số thuế không hợp lệ (tối thiểu 8-10 số)", HttpStatus.BAD_REQUEST);
    }

    // 1. Try VietQR Public Business API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.vietqr.io/v2/business/${cleanTaxCode}`, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.code === "00" && json.data && json.data.name) {
          return {
            taxCode: json.data.id || cleanTaxCode,
            name: json.data.name,
            shortName: json.data.shortName || undefined,
            address: json.data.address || undefined,
            status: json.data.status || "Đang hoạt động",
            source: "VIETQR_PUBLIC_GDT"
          };
        }
      }
    } catch (err) {
      // Ignore network/timeout errors, continue to fallback
    }

    // 2. Check local agricultural/coconut fallback dictionary
    if (FALLBACK_BUSINESS_DIRECTORY[cleanTaxCode]) {
      const item = FALLBACK_BUSINESS_DIRECTORY[cleanTaxCode];
      return {
        taxCode: cleanTaxCode,
        name: item.name,
        shortName: item.shortName,
        address: item.address,
        status: item.status,
        source: "LOCAL_DIRECTORY"
      };
    }

    throw new HttpException(`Không tìm thấy thông tin doanh nghiệp cho Mã số thuế: ${cleanTaxCode}`, HttpStatus.NOT_FOUND);
  }
}

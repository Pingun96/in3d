export const HMS_DICTIONARY: Record<string, { title: string; resolution: string; isError: boolean }> = {
  // Common Errors
  '0300_0300_0001_0001': {
    title: 'Hết nhựa ở khay AMS',
    resolution: 'Vui lòng bổ sung cuộn nhựa mới vào khay đang in và ấn nút Tiếp Tục.',
    isError: true,
  },
  '0300_0300_0001_0003': {
    title: 'Kẹt nhựa trong bộ đùn (Extruder)',
    resolution: 'Vui lòng tháo ống dẫn PTFE, kiểm tra đoạn nhựa bị kẹt ở cổ đùn. Cắt phẳng đầu dây nhựa và nạp lại.',
    isError: true,
  },
  '0300_0C00_0001_0001': {
    title: 'Cảnh báo Bún (Spaghetti Detected)',
    resolution: 'Camera AI phát hiện mẫu in có thể bị bong hoặc đùn nhựa không dính. Vui lòng kiểm tra bàn in.',
    isError: true,
  },
  '0300_0A00_0001_0002': {
    title: 'Lỗi nạp nhựa (Filament Feed Error)',
    resolution: 'Không thể đẩy nhựa từ AMS xuống đầu phun. Kiểm tra cuộn nhựa có bị rối hoặc kẹt ở bộ đệm sau máy không.',
    isError: true,
  },
  '0300_0B00_0001_0001': {
    title: 'Nắp kính chưa đóng',
    resolution: 'Hệ thống phát hiện nắp kính hoặc cửa trước đang mở khi in loại nhựa yêu cầu buồng kín (ABS/ASA).',
    isError: false,
  },
  '0500_0300_0001_0001': {
    title: 'Lỗi motor trục X/Y',
    resolution: 'Kiểm tra xem có vật cản nào chặn đầu phun di chuyển không, vệ sinh thanh trượt carbon.',
    isError: true,
  },
  '1200_1000_0001_0001': {
    title: 'Quạt làm mát không quay',
    resolution: 'Kiểm tra quạt Part Cooling, có thể bị kẹt tơ nhựa ở cánh quạt.',
    isError: true,
  }
};

export const translateHmsCode = (codeHex: string) => {
  const fullCode = `HMS_${codeHex}`; // e.g. HMS_0300_0300_0001_0001
  // We match just the suffix
  const match = Object.keys(HMS_DICTIONARY).find(k => k === codeHex || fullCode.includes(k));
  if (match) {
    return HMS_DICTIONARY[match];
  }
  return null;
};

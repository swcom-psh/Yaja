/**
 * 구글 스프레드시트 연동을 위한 Google Apps Script (GAS) 코드입니다. (v2.0 - 중복 방지 및 내역 조회 기능 추가)
 */

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheets()[0];

        var studentId = data.studentId;
        var name = data.name;
        var appliedAt = data.appliedAt;
        var dates = data.dates.join(", ");

        // 1. 기존 데이터 확인 및 중복 삭제 (학번과 이름이 일치하는 경우)
        var rows = sheet.getDataRange().getValues();
        for (var i = rows.length - 1; i >= 0; i--) {
            if (rows[i][0].toString() === studentId.toString() && rows[i][1].toString() === name.toString()) {
                sheet.deleteRow(i + 1); // 기존 신청 행 삭제
            }
        }

        // 2. 새 데이터 추가
        sheet.appendRow([studentId, name, appliedAt, dates]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheets()[0];
        var studentId = e.parameter.studentId;
        var name = e.parameter.name;

        if (!studentId || !name) {
            return ContentService.createTextOutput("신청 시스템 서버가 정상 작동 중입니다.");
        }

        var rows = sheet.getDataRange().getValues();
        var result = { found: false, dates: [] };

        for (var i = 1; i < rows.length; i++) {
            if (rows[i][0].toString() === studentId.toString() && rows[i][1].toString() === name.toString()) {
                result.found = true;
                result.dates = rows[i][3].toString().split(", ").filter(Boolean);
                break;
            }
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

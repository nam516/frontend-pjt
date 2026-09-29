// src/utils/clipboard.ts

/**
 * 짧은 문자열을 클립보드에 넣는다. 성공하면 true.
 *
 * <p>`navigator.clipboard` 는 <b>보안 컨텍스트</b>에서만 있다. https 와 localhost 는
 * 보안 컨텍스트라 개발·배포 모두 정상 경로로 동작하지만, LAN IP 로 접속해
 * 확인하는 경우(`http://192.168.x.x:5173`)에는 객체 자체가 없다. 그때 그냥 터지면
 * "복사" 가 아무 반응 없는 버튼이 되므로 옛 방식으로 한 번 더 시도한다.
 *
 * <p>둘 다 실패하면 false 를 돌려준다. 부르는 쪽이 "직접 선택해 복사해 주세요" 를
 * 띄울 수 있게 하기 위해서다. 조용히 실패하지 않는다.
 *
 * <p>(로드맵 B16 의 브랜치 이름 복사도 이 함수를 쓰면 된다)
 */
export async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        /* 권한 거부 등. 아래 옛 방식으로 한 번 더 해 본다 */
    }

    try {
        const ta = document.createElement("textarea");
        ta.value = text;

        // 화면 밖으로 보내되 display:none 은 쓰지 않는다. 안 보이는 요소는 선택이 안 된다.
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.setAttribute("readonly", "");

        document.body.appendChild(ta);
        ta.select();

        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

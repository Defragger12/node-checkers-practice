import {delay, performEnemyTurns, performPlayerTurn} from "./requests";

const RMB_CODE = 1;

const DragManager = new function() {

    let dragObject = {};

    function onMouseDown(event) {

        if (event.which !== RMB_CODE) return;

        const elem = event.target.closest('.draggable');

        if (!elem) return;

        dragObject.elem = elem;
        dragObject.downX = event.pageX;
        dragObject.downY = event.pageY;

        return false;
    }

    function onMouseMove(event) {

        if (!dragObject.elem) return;
        if (!dragObject.avatar) {
            let moveX = event.pageX - dragObject.downX;
            let moveY = event.pageY - dragObject.downY;

            if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) return;

            dragObject.avatar = createAvatar(event);
            if (!dragObject.avatar) {
                dragObject = {};
                return;
            }

            let coords = getCoords(dragObject.avatar);
            dragObject.shiftX = dragObject.downX - coords.left;
            dragObject.shiftY = dragObject.downY - coords.top;

            startDrag(event); // отобразить начало переноса
        }

        dragObject.avatar.style.left = event.pageX - dragObject.shiftX + 'px';
        dragObject.avatar.style.top = event.pageY - dragObject.shiftY + 'px';

        return false;
    }

    function onMouseUp(e) {
        if (dragObject.avatar) finishDrag(e);
        dragObject = {};
    }

    function finishDrag(e) {
        const dropElem = findDroppable(e);

        dragObject.avatar.rollback();
        if (dropElem) {
            onDragEnd(dragObject.elem.dataset.position, dropElem.dataset.position);
        }
    }

    function createAvatar(event) {

        const avatar = dragObject.elem;
        const old = {
            parent: avatar.parentNode,
            nextSibling: avatar.nextSibling,
            position: avatar.position || '',
            left: avatar.style.left || '',
            top: avatar.style.top || '',
            zIndex: avatar.zIndex || ''
        };

        avatar.rollback = function() {
            old.parent.insertBefore(avatar, old.nextSibling);
            avatar.style.position = old.position;
            avatar.style.left = old.left;
            avatar.style.top = old.top;
            avatar.style.zIndex = old.zIndex
        };

        return avatar;
    }

    function startDrag(e) {
        const avatar = dragObject.avatar;

        document.body.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
    }

    function findDroppable(event) {
        dragObject.avatar.hidden = true;
        const elem = document.elementFromPoint(event.clientX, event.clientY);
        dragObject.avatar.hidden = false;

        if (elem == null) return null;

        return elem.closest('.droppable');
    }

    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    document.onmousedown = onMouseDown;
};

async function onDragEnd(prevPosition, moveToPosition) {

    let playerTurnResult = await performPlayerTurn(prevPosition, moveToPosition);
    if (!playerTurnResult) {
        return;
    }

    let enemyTurns = await performEnemyTurns();
}

function getCoords(elem) {
    const box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}
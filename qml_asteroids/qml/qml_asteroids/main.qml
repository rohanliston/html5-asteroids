import QtQuick 2.0
import "../../../asteroids.js" as Asteroids

Rectangle {
    id: root
    width: 800
    height: 600
    focus: true
    color: "BLACK"
    border.color: "GREEN"

    Keys.onPressed: {
        switch(event.key)
        {
            case Qt.Key_A:
            case Qt.Key_Left:
                Asteroids.leftPressed = true;
                break;
            case Qt.Key_D:
            case Qt.Key_Right:
                Asteroids.rightPressed = true;
                break;
            case Qt.Key_W:
            case Qt.Key_Up:
                Asteroids.upPressed = true;
                break;
            case Qt.Key_Space:
                Asteroids.spacePressed = true;
                break;
            case Qt.Key_Return:
                if(Asteroids.playerShip === null)
                    Asteroids.spawnPlayer();
                break;
            case Qt.Key_R:
                Asteroids.init();
                break;
        }
    }

    Keys.onReleased: {
        switch(event.key)
        {
            case Qt.Key_A:
            case Qt.Key_Left:
                Asteroids.leftPressed = false;
                break;
            case Qt.Key_D:
            case Qt.Key_Right:
                Asteroids.rightPressed = false;
                break;
            case Qt.Key_W:
            case Qt.Key_Up:
                Asteroids.upPressed = false;
                break;
            case Qt.Key_Space:
                Asteroids.spacePressed = false;
                break;
        }
    }

    Component.onCompleted: {
        Asteroids.init();
    }

    Canvas {
        id: canvas
        anchors.fill: parent

        onPaint: {
            var context = getContext("2d");
            Asteroids.update();
            Asteroids.draw(context);
        }

        Text {
            id: fpsText
            color: "GREEN";
            anchors.right: parent.right;
            anchors.top: parent.top;
            anchors.rightMargin: 10
            anchors.topMargin: 10
            font.pixelSize: 16
            text: "FPS: 0"
        }

        Text {
            id: scoreText
            color: "GREEN";
            anchors.left: parent.left;
            anchors.top: parent.top;
            anchors.leftMargin: 10
            anchors.topMargin: 10
            font.pixelSize: 16
            text: "SCORE: 0"
        }

        Text {
            id: livesText
            color: "GREEN"
            anchors.left: parent.left;
            anchors.top: scoreText.bottom;
            anchors.leftMargin: 10
            anchors.topMargin: 5
            font.pixelSize: 16
            text: "LIVES: 0";
        }

        Rectangle {
            width: root.width
            height: 140
            anchors.centerIn: parent
            color: "TRANSPARENT"

            Text {
                id: respawnText
                color: "#990000"
                font.pixelSize: 20
                visible: false
                anchors.top: parent.top
                anchors.topMargin: 60
                anchors.left: parent.left
                anchors.right: parent.right
                horizontalAlignment: Text.AlignHCenter
                text: "Press ENTER to respawn"
            }

            Text {
                id: gameOverText
                color: "#990000"
                font.pixelSize: 40
                visible: false
                text: "G A M E   O V E R"
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.topMargin: 30
                horizontalAlignment: Text.AlignHCenter

                Text {
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.top: parent.bottom
                    anchors.topMargin: 10
                    font.pixelSize: 20
                    horizontalAlignment: Text.AlignHCenter
                    color: parent.color
                    visible: parent.visible
                    text: "Press R to restart"
                }
            }

            Text {
                id: gameWonText
                color: "GREEN"
                anchors.top: parent.top
                anchors.left: parent.left
                anchors.right: parent.right
                font.pixelSize: 40
                visible: false
                text: "M I S S I O N"
                horizontalAlignment: Text.AlignHCenter

                Text {
                    color: "GREEN"
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.top: parent.bottom
                    anchors.topMargin: 10
                    font.pixelSize: 40
                    visible: parent.visible
                    text: "A C C O M P L I S H E D"
                    horizontalAlignment: Text.AlignHCenter

                    Text {
                        font.pixelSize: 20
                        horizontalAlignment: Text.AlignHCenter
                        color: parent.color
                        visible: parent.visible
                        text: "Press R to restart"
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.top: parent.bottom
                        anchors.topMargin: 10
                    }
                }
            }
        }
    }

    Timer {
        id: gameLoop
        interval: 16
        running: true
        repeat: true
        onTriggered: canvas.requestPaint();
    }
}

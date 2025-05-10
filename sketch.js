// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleSize = 80; // 圓的寬高
let isDragging = false; // 是否正在拖動圓
let prevX, prevY; // 上一個手指位置
let trailLayer; // 用於繪製軌跡的圖層

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 圓的初始位置設置在畫布中央
  circleX = width / 2;
  circleY = height / 2;

  // 建立一個獨立的圖層來繪製軌跡
  trailLayer = createGraphics(width, height);
  trailLayer.clear(); // 確保圖層是透明的

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 繪製攝影機影像
  image(video, 0, 0);

  // 繪製軌跡圖層
  image(trailLayer, 0, 0);

  // 繪製圓
  fill('#669BBC'); // 修改為藍色 (#669BBC)
  noStroke();
  circle(circleX, circleY, circleSize);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    let fingerX, fingerY;
    isDragging = false; // 預設為未拖動

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 只繪製食指 (keypoints[8])
        let keypoints = hand.keypoints;
        if (keypoints.length >= 9) {
          let keypoint = keypoints[8];

          // 根據左手或右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // 左手顏色
          } else {
            fill(255, 255, 0); // 右手顏色
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);

          // 檢查食指是否接觸圓
          fingerX = keypoint.x;
          fingerY = keypoint.y;

          // 計算食指與圓心的距離
          let distance = dist(fingerX, fingerY, circleX, circleY);

          // 如果距離小於圓的半徑，讓圓跟隨食指移動
          if (distance < circleSize / 2) {
            isDragging = true; // 設定為拖動狀態

            // 如果有上一個位置，畫出軌跡到 trailLayer
            if (prevX !== undefined && prevY !== undefined) {
              trailLayer.stroke('#FFAFCC'); // 軌跡顏色
              trailLayer.strokeWeight(10); // 軌跡粗細
              trailLayer.line(prevX, prevY, fingerX, fingerY);
            }

            // 更新圓的位置
            circleX = fingerX;
            circleY = fingerY;

            // 更新上一個位置
            prevX = fingerX;
            prevY = fingerY;
          }
        }
      }
    }

    // 如果手指未接觸圓，清除上一個位置
    if (!isDragging) {
      prevX = undefined;
      prevY = undefined;
    }
  }
}

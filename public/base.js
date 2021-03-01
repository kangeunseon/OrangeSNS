$(document).ready(function () {
  //*사진 여러장 업로드 코드 수정하기*
  if (document.getElementById("img")) {
    let uploadNum = 0;
    let index = 0;
    document.getElementById("img").addEventListener("change", function (e) {
      const formData = new FormData();
      const length = this.files.length;
      const max = 4; //사진 최대 4장까지
      switch (uploadNum) {
        case 0:
          if (length > max - uploadNum) {
            alert("사진은 최대 4장까지만 가능합니다.");
            return;
          }
          uploadNum += length;
          break;
        case 1:
          if (length > max - uploadNum) {
            alert("사진은 최대 4장까지만 가능합니다.");
            return;
          }
          uploadNum += length;
          break;
        case 2:
          if (length > max - uploadNum) {
            alert("사진은 최대 4장까지만 가능합니다.");
            return;
          }
          uploadNum += length;
          break;
        case 3:
          if (length > max - uploadNum) {
            alert("사진은 최대 4장까지만 가능합니다.");
            return;
          }
          uploadNum += length;
          break;
        default:
          alert("사진은 최대 4장까지만 가능합니다.");
          return;
      }
      console.log("업로드한 사진 : ", uploadNum);
      console.log("현재 올린 사진 : ", this.files);
      for (let i = 0; i < length; i++) {
        formData.append("img", this.files[i]);
        index++;
      }
      axios
        .post("/post/img", formData)
        .then((res) => {
          let url = JSON.parse(res.data);
          console.log(url);
          let img_html = "";
          for (let i = 0; i < url.length; i++) {
            console.log("미리보기", url[i]);
            img_html += `<div class="img-preview${index}">
                  <img id="img-preview${index}" src="${url[i].url}" width="250" alt="미리보기">
                  <input id="url" type="hidden" name="img_url" value="${url[i].url}">
                  <input id="name" type="hidden" name="img_name" value="${url[i].name}">
                  <input id="size" type="hidden" name="img_size" value="${url[i].size}">
                  </div>`;
            console.log("json 길이 : ", url.length);
            console.log("서버통신index:", index);
            console.log(img_html);
            document.getElementById("img-count").value = index;
          }
          $(".img-preview").append(img_html);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  //More클릭 시 게시글 5개 추가
  document.getElementById("more-btn").addEventListener("click", () => {
    const postId = $("input[id=postId]").last().val();
    const postCount = parseInt($("input[id=postCount]").last().val()); //페이징 확인 변수
    const myId = $("input[id=my-id]").val();
    console.log(myId);
    let count = 1;
    console.log(postId, ",", postCount);
    axios
      .get(`/more?postId=${postId}`)
      .then((res) => {
        if (res.data.posts.length > 0) {
          let html = "";
          for (let post of res.data.posts) {
            html += `<article>
                      <div class="panel panel-default">
                        <div class="panel-head">${post.user.nick}</div>
                        <div class="panel-body">${post.content}</div>
                          <input id="postId" type="hidden" value="${post.id}" />
                  `;
            for (let img of res.data.imgs) {
              if (post.id === img.postId) {
                html += `<div class="post-img">
                          <img
                            class="img-responsive"
                            src="${img.url}"
                            alt="섬네일"
                            alt="Responsive image"
                          />
                          <input type="hidden" value="${img.id}" id="img-id" />
                        </div>`;
              }
            }
            let index = parseInt(postCount - 1) + parseInt(count);
            html += `<div class="like" id="like${index}" value="${post.id}">`;
            if (res.data.likeList.length === 0) {
              html += `<div class="post-NLike">
              <button type="button" class="btn btn" aria-label="Left Align">
                <span
                  id="heart"
                  class="glyphicon glyphicon-heart-empty"
                  aria-hidden="true"
                ></span>
            </div>`;
            } else {
              let check = false; //좋아요 눌렀는지 확인하는 변수
              for (let likeId of res.data.likeList) {
                if (likeId === post.id) {
                  check = true;
                  break;
                }
              }
              if (check) {
                html += `<div class="post-Like">
                <button type="button" class="btn btn" aria-label="Left Align">
                  <span
                    id="heart"
                    class="glyphicon glyphicon-heart"
                    aria-hidden="true"
                  ></span>
              </div>`;
              } else {
                html += `<div class="post-NLike">
                <button type="button" class="btn btn" aria-label="Left Align">
                  <span
                    id="heart"
                    class="glyphicon glyphicon-heart-empty"
                    aria-hidden="true"
                  ></span>
              </div>`;
              }
            }
            html += `</div></div></article>`;
            count++;
          }
          html += `<input id="postCount" type="hidden" value="${
            postCount + (count - 1)
          }">`;
          $(".posts").append(html);
        } else {
          alert("더 이상 볼 게시글이 없습니다.");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  //팔로우
  $(document).on("click", ".user-follow", function () {
    const myId = $("input[id=my-id]").val();
    if (myId) {
      const userId = $(this).prev().attr("value");
      console.log(userId);
      if (userId !== myId) {
        if (confirm("팔로잉하시겠습니까?")) {
          axios
            .post(`/user/${userId}/follow`)
            .then(() => {
              // $(this).attr("class", "user-unfollow");
              // $(this).html("언팔로우하기");
              location.reload();
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
    }
  });

  //언팔로우
  $(document).on("click", ".user-unfollow", function () {
    const myId = $("input[id=my-id]").val();
    if (myId) {
      const userId = $(this).prev().attr("value");
      console.log(userId);
      if (userId !== myId) {
        if (confirm("정말 언팔로잉 하시겠습니까?")) {
          axios
            .delete(`/user/${userId}/unfollow`)
            .then(() => {
              // $(this).attr("class", "user-follow");
              // $(this).html("팔로우하기");
              location.reload();
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
    }
  });

  //좋아요 추가
  $(document).on("click", ".post-NLike", function () {
    const myId = document.querySelector("#my-id");
    console.log($(this));
    const postId = $(this).parent().attr("value");
    let div = $(this);
    let heart = $(this).children().children();
    if (myId) {
      axios
        .post(`/post/heart/${postId}`)
        .then(() => {
          div.attr("class", "post-Like");
          heart.attr("class", "glyphicon glyphicon-heart"); //span-채운 하트로 변경하기
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  //좋아요 삭제
  $(document).on("click", ".post-Like", function () {
    const myId = document.querySelector("#my-id");
    console.log($(this));
    const postId = $(this).parent().attr("value");
    console.log(postId);
    let div = $(this);
    let heart = $(this).children().children();
    if (myId) {
      axios
        .delete(`/post/heart/${postId}`)
        .then(() => {
          div.attr("class", "post-NLike");
          heart.attr("class", "glyphicon glyphicon-heart-empty"); //span-채운 하트로 변경하기
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  //게시글 수정
  $(document).on("click", "#dropdown-post-update", function () {
    const postId = $(this).parent().attr("id").substr(18);
    console.log(postId);
    $(`#update-Modal${postId}`).modal("show");
  });

  //게시글 삭제
  $(document).on("click", "#dropdown-post-delete", function () {
    const postId = $(this).parent().attr("id").substr(18);
    console.log(postId);
    axios
      .delete(`/post/${postId}`)
      .then(() => {
        location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

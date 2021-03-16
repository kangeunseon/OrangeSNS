$(document).ready(function () {
  //*사진 여러장 업로드 코드 수정하기*
  let uploadNum = 0; //업로드 사진 개수 카운트
  if (document.getElementById("img")) {
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
      }
      axios
        .post("/post/img", formData)
        .then((res) => {
          let url = JSON.parse(res.data);
          let index = document.getElementById("img-count").value;
          let img_html = "";
          let imgClassName = "img-preview";
          for (let i = 0; i < url.length; i++) {
            console.log("미리보기", url[i]);
            img_html +=
              `<div id="img-preview${index}">
                  <img id="img${index}" src="${url[i].url}" width="250" alt="미리보기">
                    <input id="url" type="hidden" name="img_url" value="${url[i].url}">
                    <input id="name" type="hidden" name="img_name" value="${url[i].name}">
                    <input id="size" type="hidden" name="img_size" value="${url[i].size}">
                    <button type="button" class="close-btn" aria-label="Close" onclick="removeImg('` +
              imgClassName +
              `',${index})" >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>`;
            console.log("json 길이 : ", url.length);
            console.log(img_html);
            index++;
            document.getElementById("img-count").value = index;
          }
          $(".img-preview").append(img_html);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  //onclick 함수 앞에 window 붙이기
  //게시글 업로드 미리보기 파일 폴더에서 지우귀
  window.removeImg = function (className, index) {
    if (className === "img-preview") {
      let img_name = $(`#img${index}`).attr("src").substr(5); // src 앞에 /img/ 지우기
      axios
        .delete(`/post/img?img_name=${img_name}`)
        .then(() => {
          document.getElementById("img-count").value -= 1;
          if (uploadNum > 0) {
            uploadNum--;
          }
          console.log(document.getElementById("img-count").value);
          $(`#img-preview${index}`).remove();
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (className === "origin-img-preview") {
      $(`#origin-img-preview${index}`).hide();
    } else if (className === "add-img-preview") {
      $(`#add-img-preview${index}`).hide();
    }
  };

  //More클릭 시 게시글 5개 추가
  $("#more-btn").on("click", () => {
    const postId = $("input[id=postId]").last().val();
    const postCount = parseInt($("input[id=postCount]").last().val()); //페이징 확인 변수
    const myId = $("input[id=my-id]").val();
    console.log(myId);
    let count = 1;
    console.log(postId, ",", postCount);
    axios
      .get(`/more?postId=${postId}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.posts.length > 0) {
          let html = "";
          for (let post of res.data.posts) {
            html += `<article>
                      <div class="panel panel-default" id="post${post.id}">
                        <div class="panel-head">
                          ${post.user.nick}
                          <div class="set-post">
                            <input class="post-user-id" type="hidden" value="${post.user.id}" />`;
            const follow = myId && res.data.followings.includes(post.user.id);
            if (post.user.id != myId && !follow) {
              html += `<div class="follow">
                        <button class="btn btn-default btn-xs" id="user-follow">팔로우하기</button>
                      </div>`;
            } else if (post.user.id != myId && follow) {
              html += `<div class="follow">
                        <button class="btn btn-default btn-xs" id="user-unfollow">언팔로우하기</button>
                      </div>`;
            } else if (myId && myId == post.user.id) {
              html += `  <!-게시글 드롭다운버튼-->
                        <div class="dropdown" id="post${post.id}-dropdown">
                          <button
                            type="button"
                            class="btn btn dropdown-toggle"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                          <span class="glyphicon glyphicon-option-vertical"></span>
                        </button>
                        <ul class="dropdown-menu" id="dropdown-menu-post${post.id}" role="menu" aria-label="dLabel">
                          <li id="dropdown-post-update">수정</li>
                          <li id="dropdown-post-delete">삭제</li>
                        </ul>
                        <!--글 수정 모달-->
                        <div
                          class="modal fade"
                          id="update-Modal${post.id}"
                          tabindex="-1"
                          role="dialog"
                          aria-hidden="true"
                        >
                          <div class="modal-dialog">
                            <div class="modal-content">
                              <div class="modal-header">
                                <button
                                  type="button"
                                  class="close"
                                  id="update-Modal-closeBtn"
                                  data-dismiss="modal"
                                  aria-label="Close"
                                >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                                <h4 class="modal-title" id="update-post">글 수정하기</h4>
                              </div>
                              <div class="modal-body">
                                <form
                                  id="form${post.id}"
                                  action="/post/${post.id}"
                                  method="post"
                                  enctype="multipart/form-data"
                                >
                                  <div class="form-group">
                                    <label for="origin-content" class="control-label"
                                      >수정할 글</label
                                    >
                                    <textarea
                                      type="text"
                                      maxlength="140"
                                      class="form-control"
                                      id="origin-content"
                                      name="content"
                                      required
                                    >${post.content}</textarea>
                                    <div class="origin-img-preview${post.id}"></div>
                                    <div class="add-img-preview${post.id}"></div>
                                    <div class="filebox">
                                      <lable for="update-img">사진 업로드</lable>
                                      <input
                                        id="update-img"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                      />
                                    </div>
                                  </div>
                                  <div class="modal-footer">
                                    <button
                                      id="postModal-update-btn"
                                      type="submit"
                                      class="btn btn-primary"
                                    >
                                      변경하기
                                    </button>
                                    <button
                                      type="button"
                                      id="postModal-cancel-btn"
                                      class="btn btn-default"
                                      data-dismiss="modal"
                                    >
                                      취소하기
                                    </button>
                                  </div>
                                </form>
                              </div>
                              
                            </div>
                          </div>
                        </div>
                        </div>`;
            }
            html += `</div>
                      </div>
                      <div class="panel-body">${post.content}</div>  
                      <input id="postId" type="hidden" value="${post.id}" />
                      <div id="post${post.id}-imgs">
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
            html += `</div>`;
            let index = parseInt(postCount - 1) + parseInt(count);
            html += `<div class="like" id="like${index}" value="${post.id}">`;
            if (res.data.likeList.length === 0) {
              html += `<div class="post-NLike">
              <button id="nlikeBtn" type="button" class="btn btn" aria-label="Left Align">
                <span
                  id="heart"
                  class="glyphicon glyphicon-heart-empty hex"
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
                <button id="likeBtn" type="button" class="btn btn" aria-label="Left Align">
                  <span
                    id="heart"
                    class="glyphicon glyphicon-heart hex"
                    aria-hidden="true"
                  ></span>
              </div>`;
              } else {
                html += `<div class="post-NLike">
                <button id="nlikeBtn" type="button" class="btn btn" aria-label="Left Align">
                  <span
                    id="heart"
                    class="glyphicon glyphicon-heart-empty hex"
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
  $(document).on("click", "#user-follow", function () {
    const myId = $("input[id=my-id]").val();
    if (myId) {
      const userId = $(this).parent().prev().attr("value");
      console.log(userId);
      if (userId !== myId) {
        if (confirm("팔로잉하시겠습니까?")) {
          axios
            .post(`/user/${userId}/follow`)
            .then(() => {
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
  $(document).on("click", "#user-unfollow", function () {
    const myId = $("input[id=my-id]").val();
    if (myId) {
      const userId = $(this).parent().prev().attr("value");
      console.log(userId);
      if (userId !== myId) {
        if (confirm("정말 언팔로잉 하시겠습니까?")) {
          axios
            .delete(`/user/${userId}/unfollow`)
            .then(() => {
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
  $(document).on("click", "#nlikeBtn", function () {
    const myId = document.querySelector("#my-id");
    const postId = $(this).parent().parent().attr("value");
    let div = $(this).parent();
    let heart = $(this).children();
    if (myId) {
      axios
        .post(`/post/heart/${postId}`)
        .then(() => {
          $(this).attr("id", "likeBtn");
          div.attr("class", "post-Like");
          heart.attr("class", "glyphicon glyphicon-heart hex"); //span-채운 하트로 변경하기
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  //좋아요 삭제
  $(document).on("click", "#likeBtn", function () {
    const myId = document.querySelector("#my-id");
    const postId = $(this).parent().parent().attr("value");
    let div = $(this).parent();
    let heart = $(this).children();
    if (myId) {
      axios
        .delete(`/post/heart/${postId}`)
        .then(() => {
          $(this).attr("id", "nlikeBtn");
          div.attr("class", "post-NLike");
          heart.attr("class", "glyphicon glyphicon-heart-empty hex"); //span-채운 하트로 변경하기
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  //게시글 수정
  $(document).on("click", "#dropdown-post-update", function () {
    const postId = $(this).parent().attr("id").substr(18);
    let html = "";
    let imgClassName = "origin-img-preview";
    $(`#post${postId}-imgs`)
      .children()
      .each(function (index) {
        //origin-img-preview
        let origin_img = $(this).children();
        let origin_imgId = origin_img.next().val();
        html +=
          `<div id="origin-img-preview${index}">
                  <img id="origin-img${index}" src="${origin_img.attr(
            "src"
          )}" alt="섬네일"/>
                  <input type="hidden" value=${origin_imgId} id="originImg-id"/>
                  <button type="button" class="close-btn" aria-label="Close" onclick="removeImg('` +
          imgClassName +
          `',${index})" >
                      <span aria-hidden="true">&times;</span>
                  </button>
                </div>`;
      });
    $(`.origin-img-preview${postId}`).append(html);
    $(`#update-Modal${postId}`).modal("show");
    let add_img_index = 0;
    let count = 0; //이미지 프리뷰 카운트
    let img_sum = 0;
    $(document).on("change", "#update-img", function () {
      //추가한 사진 미리보기
      //새로운 이미지 추가
      const length = this.files.length; //업로드한 파일 길이
      let add_imgClassName = "add-img-preview";
      let origin_imgs = $(this).parent().prev().prev();
      let origin_imgs_length = origin_imgs.children().length;
      let add_imgs = $(this).parent().prev();
      let add_imgs_length = add_imgs.children().length;
      for (let i = 0; i < origin_imgs.children().length; i++) {
        if ($(`#origin-img-preview${i}`).is(":hidden")) {
          //이미지 삭제 체크
          origin_imgs_length--;
        }
      }
      for (let i = 0; i < add_imgs.children().length; i++) {
        if ($(`#add-img-preview${i}`).is(":hidden")) {
          //이미지 삭제 체크
          add_imgs_length--;
        }
      }
      img_sum = origin_imgs_length + add_imgs_length;
      console.log("최종", img_sum);
      if (img_sum + length > 4 || img_sum > 4 || length > 4) {
        alert("사진은 최대 4장까지만 가능합니다.");
        return;
      } else {
        const formData = new FormData();
        for (let i = 0; i < length; i++) {
          formData.append("img", this.files[i]); //새로운 사진 form에 추가
        }
        axios
          .post("/post/img", formData)
          .then((res) => {
            let url = JSON.parse(res.data);
            let addHtml = "";
            for (let i = 0; i < url.length; i++) {
              addHtml +=
                `<div id="add-img-preview${add_img_index}">
              <img id="add-img${add_img_index}" src="${url[i].url}" alt="섬네일"/>
              <input id="name" type="hidden" name="img_name" value="${url[i].name}">
              <input id="size" type="hidden" name="img_size" value="${url[i].size}">
              <button type="button" class="close-btn" aria-label="Close" onclick="removeImg('` +
                add_imgClassName +
                `',${add_img_index})" >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>`;
              add_img_index++;
            }
            $(`.add-img-preview${postId}`).append(addHtml);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
    $(document).on("click", "#postModal-update-btn", function () {
      //수정하기 click event
      $(document).on("submit", `#form${postId}`, function (event) {
        event.preventDefault(); //submit event멈추고 axios실행
        let content = $(this).find("[name=content]").val(); //form-content 가져오기
        let origin_imgs = $(this).find(`.origin-img-preview${postId}`);
        let origin_imgs_length = origin_imgs.children().length;
        let add_imgs = $(this).find(`.add-img-preview${postId}`);
        let add_imgs_length = add_imgs.children().length;
        console.log("변경된 content", content);
        console.log(origin_imgs.children().length, add_imgs.children().length);
        let del_imgList = new Array(); //삭제할 이미지 id배열
        let add_imgList = new Array(); //추가한 이미지 객체 배열
        for (let i = 0; i < origin_imgs_length; i++) {
          if ($(`#origin-img-preview${i}`).is(":hidden")) {
            //이미지 삭제 체크
            let hide_imgId = $(`#origin-img-preview${i}`)
              .children()
              .next()
              .val();
            del_imgList.push(hide_imgId);
          }
        }
        for (let i = 0; i < add_imgs_length; i++) {
          if ($(`#add-img-preview${i}`).is(":visible")) {
            add_imgList.push({
              url: $(`#add-img-preview${i}`).children().attr("src"),
              name: $(`#add-img-preview${i}`).children().next().val(),
              size: $(`#add-img-preview${i}`).children().next().next().val(),
            });
          }
        }
        axios
          .patch(`/post/${postId}`, { content, del_imgList, add_imgList })
          .then(() => {
            location.reload();
          })
          .catch((err) => {
            console.error(err);
          });
      });
    });
    $(document).on("click", "#postModal-cancel-btn", function () {
      //취소하면 preview 삭제
      $(`.origin-img-preview${postId} *`).remove();
      $(`.add-img-preview${postId} *`).remove();
    });
    $(document).on("click", "#update-Modal-closeBtn", function () {
      //취소하면 preview 삭제
      $(`.origin-img-preview${postId} *`).remove();
      $(`.add-img-preview${postId} *`).remove();
    });
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

  $("#profile-update-btn").on("click", function () {
    $("#profileModal").modal("show");
  });

  window: setProfile = function () {
    const nick = $("#modifi-nick").val();
    const myId = $("input[id=my-id]").val();
    if (nick) {
      axios
        .patch(`/user/${nick}`)
        .then(() => {
          location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      confirm("닉네임을 입력해주세요.");
    }
  };
});

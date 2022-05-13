function INFO(title, message) {
    console.log("INFO: " + title + ": " + message);
    toastr.success(message, title, {
      positionClass: "toast-bottom-right",
      timeOut: 5e3,
      closeButton: !0,
      debug: !1,
      newestOnTop: !0,
      progressBar: !0,
      preventDuplicates: !0,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
      tapToDismiss: !1
    })
  }
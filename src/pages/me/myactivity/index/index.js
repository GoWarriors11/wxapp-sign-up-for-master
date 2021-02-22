const app = getApp();
const memberApi = require("../../../../api/memberApi");
const { ResultCode } = require("../../../../utils/resultCode");
const utils = require("../../../../utils/utils");
Page({
  data: {
    navbar: ["我发起的", "我参加的", "浏览过的"],
    currentTab: "",
    isNullMyPublish: false,
    isNullMyParticipate: false,
    isNullMyBrowse: false,
    lastPage: false,
    myPublishListContentParam: {
      pageNum: 0,
      pageSize: 15,
    },
    myParticipateListContentParam: {
      pageNum: 0,
      pageSize: 15,
    },
    myBrowseListContentParam: {
      pageNum: 0,
      pageSize: 15,
    },
    myPublishList: [],
    myParticipateList: [],
    myBrowseList: [],
    myPublishLastPage: false,
    myParticipateLastPage: false,
    myBrowseLastPage: false,
  },
  navbarTap: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
    });
    const currentTab = e.currentTarget.dataset.idx;
    if (currentTab === 0) {
      this.getMyPublishList();
    }
    if (currentTab === 1) {
      this.getMyParticipateList();
    }
    if (currentTab === 2) {
      this.getMyBrowseList();
    }
  },
  showdetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/me/myactivity/detail/detail?id=${id}`,
    });
  },

  // 我发起的
  getMyPublishList: async function(param = {}) {
    let pagination = this.data.myPublishListContentParam;
    pagination = Object.assign(pagination, param);
    const res = await memberApi.myPublish(pagination);
    if (res.code === ResultCode.success) {
      const data = res.data,
        rows = data.rows;
      let myPublishList = [];
      rows.map((el) => {
        el.finishTime = utils.formatDate(new Date(el.finishTime), "hh:ii");
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "YYYY年MM月DD日 hh:ii");
        el.date = utils.formatDate(new Date(el.startTime), "MM月DD日 周W hh:ii");
        return el;
      });
      // 判断是否为第一页加载
      if (pagination.pageNum === 0) {
        myPublishList = rows;
        if (myPublishList.length === 0) {
          this.setData({
            isNullMyPublish: true,
          });
        } else {
          this.setData({
            isNullMyPublish: false,
          });
        }
      } else {
        myPublishList = this.data.list.concat(rows);
      }

      // 赋值
      this.setData({
        myPublishList,
        myPublishLastPage: data.pageInfo.isLast,
        myPublishListContentParam: pagination,
      });
    }
  },

  // 我参与的
  getMyParticipateList: async function(param = {}) {
    let pagination = this.data.myParticipateListContentParam;
    pagination = Object.assign(pagination, param);
    const res = await memberApi.myParticipate(pagination);
    if (res.code === ResultCode.success) {
      const data = res.data,
        rows = data.rows;
      let myParticipateList = [];
      rows.map((el) => {
        el.finishTime = utils.formatDate(new Date(el.finishTime), "hh:ii");
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "YYYY年MM月DD日 hh:ii");
        el.date = utils.formatDate(new Date(el.startTime), "MM月DD日 周W hh:ii");
        return el;
      });
      // 判断是否为第一页加载
      if (pagination.pageNum === 0) {
        myParticipateList = rows;
        if (myParticipateList.length === 0) {
          this.setData({
            isNullMyParticipate: true,
          });
        } else {
          this.setData({
            isNullMyParticipate: false,
          });
        }
      } else {
        myParticipateList = this.data.list.concat(rows);
      }
      // 赋值
      this.setData({
        myParticipateList,
        myParticipateLastPage: data.pageInfo.isLast,
        myParticipateListContentParam: pagination,
      });
    }
  },

  // 我浏览过的
  getMyBrowseList: async function(param = {}) {
    let pagination = this.data.myBrowseListContentParam;
    pagination = Object.assign(pagination, param);
    const res = await memberApi.myBrowse(pagination);
    if (res.code === ResultCode.success) {
      const data = res.data,
        rows = data.rows;
      let myBrowseList = [];
      rows.map((el) => {
        el.finishTime = utils.formatDate(new Date(el.finishTime), "hh:ii");
        el.gmtCreate = utils.formatDate(new Date(el.gmtCreate), "YYYY年MM月DD日 hh:ii");
        el.date = utils.formatDate(new Date(el.startTime), "MM月DD日 周W hh:ii");
        return el;
      });
      // 判断是否为第一页加载
      if (pagination.pageNum === 0) {
        myBrowseList = rows;
        if (myBrowseList.length === 0) {
          this.setData({
            isNullMyBrowse: true,
          });
        } else {
          this.setData({
            isNullMyBrowse: false,
          });
        }
      } else {
        myBrowseList = this.data.list.concat(rows);
      }
      // 赋值
      this.setData({
        myBrowseList,
        myBrowseLastPage: data.pageInfo.isLast,
        myBrowseListContentParam: pagination,
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    await app.verifyLogin();
    this.setData({
      currentTab: options.type,
    });
    const currentTab = this.data.currentTab;
    if (currentTab === "0") {
      this.getMyPublishList();
    }
    if (currentTab === "1") {
      this.getMyParticipateList();
    }
    if (currentTab === "2") {
      this.getMyBrowseList();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function() {
    this.getMyPublishList();
    this.getMyParticipateList();
    this.getMyBrowseList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const page = this;
    const myPublishLastPage = page.data.myPublishLastPage,
      myPublishListContentParam = page.data.myPublishListContentParam;
    if (!myPublishLastPage) {
      myPublishListContentParam.pageNum = myPublishListContentParam.pageNum + 1;
      page.getMyPublishList(myPublishListContentParam);
    }
    const myParticipateLastPage = page.data.myParticipateLastPage,
      myParticipateListContentParam = page.data.myParticipateListContentParam;
    if (!myParticipateLastPage) {
      myParticipateListContentParam.pageNum = myParticipateListContentParam.pageNum + 1;
      page.getMyParticipateList(myParticipateListContentParam);
    }
    const myBrowseLastPage = page.data.myBrowseLastPage,
      myBrowseListContentParam = page.data.myBrowseListContentParam;
    if (!myBrowseLastPage) {
      myBrowseListContentParam.pageNum = myBrowseListContentParam.pageNum + 1;
      page.getMyBrowseList(myBrowseListContentParam);
    }
  },
});

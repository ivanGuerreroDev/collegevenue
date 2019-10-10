import React from "react";
import { Redirect } from "react-router-dom";

// Layout Types
import { DefaultLayout, LoginLayout } from "./layouts";

// Route Views
import BlogOverview from "./views/BlogOverview";
import UserProfileLite from "./views/UserProfileLite";
import AddNewPost from "./views/AddNewPost";
import Errors from "./views/Errors";
import ComponentsOverview from "./views/ComponentsOverview";
import Users from "./views/Users";
import User from "./views/User";
import Tables from "./views/Tables";
import BlogPosts from "./views/BlogPosts";
import Login from "./views/Login"; 
import Domains from "./views/Domains"; 
import Posts from "./views/Posts"; 
import SystemMessage from "./views/SystemMessage"; 
 
export default [
  {
    path: "/",
    exact: true,
    protected: false,
    layout: LoginLayout,
    component: Login
  },
  {
    path: "/dashboard",
    protected: true,
    layout: DefaultLayout,
    component: BlogOverview
  },
  {
    path: "/domains",
    protected: true,
    layout: DefaultLayout,
    component: Domains
  },
  {
    path: "/posts",
    protected: true,
    layout: DefaultLayout,
    component: Posts
  },
  { 
    path: "/users",
    layout: DefaultLayout,
    protected: true,
    component: Users
  },
  {
    path: "/user/:id?",
    protected: true,
    layout: DefaultLayout,
    component: User
  },
  { 
    path: "/system-message",
    layout: DefaultLayout,
    protected: true,
    component: SystemMessage
  },
  {
    path: "/user-profile-lite",
    protected: true,
    layout: DefaultLayout,
    component: UserProfileLite
  },
  {
    path: "/add-new-post",
    protected: true,
    layout: DefaultLayout,
    component: AddNewPost
  },
  {
    path: "/errors",
    protected: true,
    layout: DefaultLayout,
    component: Errors
  },
  {
    path: "/components-overview",
    protected: true,
    layout: DefaultLayout,
    component: ComponentsOverview
  },
  {
    path: "/tables",
    protected: true,
    layout: DefaultLayout,
    component: Tables
  },
  {
    path: "/blog-posts",
    protected: true,
    layout: DefaultLayout,
    component: BlogPosts
  }
];

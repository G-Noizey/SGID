import React from "react";
import {
    AppBar, Toolbar, IconButton, Typography,
    CssBaseline, Box
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const DashboardLayoutAdmin = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        Swal.fire({
            title: "¿Quieres cerrar sesión?",
            text: "Regresarás a la pantalla de inicio.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Cerrando sesión",
                    text: "Has cerrado sesión.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    logout();
                });
            }
        });
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: 1201, backgroundColor: "var(--beige-dark)" }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap component="div">
                        SGID - Sistema de Generación de Invitaciones Digitales
                    </Typography>
                   <Box
                        onClick={handleLogout}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            color: "white",
                        }}
                    >
                        <IconButton color="inherit">
                            <LogoutIcon />
                        </IconButton>
                        <Typography variant="body1">
                            Cerrar sesión
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayoutAdmin;

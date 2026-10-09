
import { Request, Response } from 'express';
import pool from '../conf/dbConnection';

// Validar que el ID sea un entero positivo
const validId = (value: any): number | null => {
    const id = Number(value);

    if (
        typeof value !== 'string' ||
        !/^[1-9]\d*$/.test(value) ||
        !Number.isSafeInteger(id)
    ) {
        return null;
    }

    return id;
};

// Validar los datos completos de un producto
const validProduct = (body: any): boolean => {
    return (
        typeof body?.name === 'string' &&
        body.name.trim().length > 0 &&
        typeof body.price === 'number' &&
        Number.isFinite(body.price) &&
        body.price > 0 &&
        Number.isInteger(body.stock) &&
        body.stock >= 0 &&
        typeof body.description === 'string' &&
        body.description.trim().length > 0 &&
        (body.brand == null || typeof body.brand === 'string') &&
        (body.img == null || typeof body.img === 'string')
    );
};

// 1. GET ALL - Obtener todos los productos activos
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const active: any = req.query.active;

        if (active !== undefined && active !== 'TRUE') {
            res.status(400).json({
                message: 'El parámetro active debe ser TRUE'
            });
            return;
        }

        const [rows]: any = await pool.query(
            'SELECT * FROM products WHERE active = ?',
            [1]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener productos:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// 2. GET BY ID - Obtener un producto activo por ID
export const getProductById = async (req: Request, res: Response) => {
    const id = validId(req.params.id);

    if (id === null) {
        res.status(400).json({
            message: 'ID inválido'
        });
        return;
    }

    try {
        const [rows]: any = await pool.query(
            'SELECT * FROM products WHERE id = ? AND active = ?',
            [id, 1]
        );

        if (rows.length === 0) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error('Error al buscar producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// 3. POST - Crear un producto
export const createProduct = async (req: Request, res: Response) => {
    const body: any = req.body;

    if (!validProduct(body)) {
        res.status(400).json({
            message: 'Datos del producto inválidos'
        });
        return;
    }

    try {
        const [result]: any = await pool.query(
            `INSERT INTO products
            (name, price, stock, description, brand, img, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                body.name.trim(),
                body.price,
                body.stock,
                body.description.trim(),
                body.brand ?? null,
                body.img ?? null,
                1
            ]
        );

        res.status(201).json({
            message: 'Producto creado correctamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al crear producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// 4. PUT - Actualizar todos los datos de un producto activo
export const updateProduct = async (req: Request, res: Response) => {
    const id = validId(req.params.id);
    const body: any = req.body;

    if (id === null) {
        res.status(400).json({
            message: 'ID inválido'
        });
        return;
    }

    if (!validProduct(body)) {
        res.status(400).json({
            message: 'Datos del producto inválidos'
        });
        return;
    }

    try {
        const [result]: any = await pool.query(
            `UPDATE products
             SET name = ?,
                 price = ?,
                 stock = ?,
                 description = ?,
                 brand = ?,
                 img = ?
             WHERE id = ? AND active = ?`,
            [
                body.name.trim(),
                body.price,
                body.stock,
                body.description.trim(),
                body.brand ?? null,
                body.img ?? null,
                id,
                1
            ]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }

        res.status(200).json({
            message: 'Producto actualizado correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// 5. DELETE - Dar de baja lógica un producto
export const deleteProduct = async (req: Request, res: Response) => {
    const id = validId(req.params.id);

    if (id === null) {
        res.status(400).json({
            message: 'ID inválido'
        });
        return;
    }

    try {
        const [result]: any = await pool.query(
            'UPDATE products SET active = ? WHERE id = ? AND active = ?',
            [0, id, 1]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }

        res.status(200).json({
            message: 'Producto desactivado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// 6. PATCH - Modificar exclusivamente el precio
export const changeProductPrice = async (req: Request, res: Response) => {
    const id = validId(req.params.id);
    const price: any = req.body?.price;

    if (id === null) {
        res.status(400).json({
            message: 'ID inválido'
        });
        return;
    }

    if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        res.status(400).json({
            message: 'El precio debe ser un número mayor que cero'
        });
        return;
    }

    try {
        const [result]: any = await pool.query(
            'UPDATE products SET price = ? WHERE id = ? AND active = ?',
            [price, id, 1]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }

        res.status(200).json({
            message: 'Precio actualizado correctamente'
        });

    } catch (error) {
        console.error('Error al cambiar precio:', error);

        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

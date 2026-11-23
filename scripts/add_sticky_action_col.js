const fs = require('fs');

let file = fs.readFileSync('apps/web/screens/capital-investment-screen.tsx', 'utf8');

// 1. Sticky Thao tác column in thead
file = file.replace(
  '<th style={{ textAlign: "center", width: "90px" }}>Thao tác</th>',
  '<th style={{ textAlign: "center", width: "95px", position: "sticky", right: 0, background: "#edf5f2", zIndex: 4, boxShadow: "-2px 0 4px rgba(0,0,0,0.04)" }}>Thao tác</th>'
);

// 2. Sticky Thao tác in normal row
file = file.replace(
  '<td style={{ textAlign: "center" }}>\r\n                              <button\r\n                                type="button"\r\n                                className="button"\r\n                                onClick={() => handleStartInlineEdit(a)}',
  '<td style={{ textAlign: "center", position: "sticky", right: 0, background: "#ffffff", zIndex: 2, boxShadow: "-2px 0 4px rgba(0,0,0,0.04)" }}>\r\n                              <button\r\n                                type="button"\r\n                                className="button"\r\n                                onClick={() => handleStartInlineEdit(a)}'
);
file = file.replace(
  '<td style={{ textAlign: "center" }}>\n                              <button\n                                type="button"\n                                className="button"\n                                onClick={() => handleStartInlineEdit(a)}',
  '<td style={{ textAlign: "center", position: "sticky", right: 0, background: "#ffffff", zIndex: 2, boxShadow: "-2px 0 4px rgba(0,0,0,0.04)" }}>\n                              <button\n                                type="button"\n                                className="button"\n                                onClick={() => handleStartInlineEdit(a)}'
);

// 3. Sticky Thao tác in editing row
file = file.replace(
  '<td style={{ textAlign: "center", whiteSpace: "nowrap" }}>\r\n                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>',
  '<td style={{ textAlign: "center", whiteSpace: "nowrap", position: "sticky", right: 0, background: "#f0fdf4", zIndex: 3, boxShadow: "-2px 0 4px rgba(0,0,0,0.06)" }}>\r\n                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>'
);
file = file.replace(
  '<td style={{ textAlign: "center", whiteSpace: "nowrap" }}>\n                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>',
  '<td style={{ textAlign: "center", whiteSpace: "nowrap", position: "sticky", right: 0, background: "#f0fdf4", zIndex: 3, boxShadow: "-2px 0 4px rgba(0,0,0,0.06)" }}>\n                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>'
);

// 4. Sticky Thao tác in tfoot
file = file.replace(
  '<td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>\r\n                      </tr>\r\n                    </tfoot>',
  '<td style={{ textAlign: "center", color: "var(--muted)", position: "sticky", right: 0, background: "#f0fdf4", zIndex: 3, boxShadow: "-2px 0 4px rgba(0,0,0,0.04)" }}>—</td>\r\n                      </tr>\r\n                    </tfoot>'
);
file = file.replace(
  '<td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>\n                      </tr>\n                    </tfoot>',
  '<td style={{ textAlign: "center", color: "var(--muted)", position: "sticky", right: 0, background: "#f0fdf4", zIndex: 3, boxShadow: "-2px 0 4px rgba(0,0,0,0.04)" }}>—</td>\n                      </tr>\n                    </tfoot>'
);

fs.writeFileSync('apps/web/screens/capital-investment-screen.tsx', file, 'utf8');
console.log('Successfully added Sticky Action Column!');
